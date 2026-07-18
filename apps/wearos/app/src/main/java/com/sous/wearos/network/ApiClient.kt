package com.sous.wearos.network

import android.content.Context
import android.content.Intent
import android.util.Log
import com.sous.wearos.BuildConfig
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import java.util.concurrent.TimeUnit

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: String?,
    val timestamp: String?
)

data class MetricsResponse(val value: String)

data class PairInitRequest(val deviceType: String = "wearos")
data class PairInitResponse(val code: String)
data class PairStatusResponse(val status: String, val token: String?)

data class OmniMessage(
    val id: String,
    val role: String,
    val content: String,
    val timestamp: String
)

data class CommandRequest(val chatHistory: List<OmniMessage>, val source: String = "wearos")
data class CommandResponse(val success: Boolean)

// ---------------------------------------------------------------------------
// API service interface — NO manual @Header params; the interceptor handles it
// ---------------------------------------------------------------------------

interface ApiService {
    @GET("/api/metrics/sales")
    suspend fun getSalesMetrics(): MetricsResponse

    @GET("/api/metrics/ticket-time")
    suspend fun getTicketTimeMetrics(): MetricsResponse

    @POST("/api/devices/pair/init")
    suspend fun initPairing(@Body request: PairInitRequest): ApiResponse<PairInitResponse>

    @GET("/api/devices/pair/status/{code}")
    suspend fun checkPairingStatus(@Path("code") code: String): ApiResponse<PairStatusResponse>

    @POST("/commands/execute")
    suspend fun sendCommand(@Body request: CommandRequest): ApiResponse<CommandResponse>
}

// ---------------------------------------------------------------------------
// Auth Interceptor — reads token from DataStore and injects Bearer header
// OkHttp interceptors run on a background thread so runBlocking is safe here.
// ---------------------------------------------------------------------------

class AuthInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token: String? = runBlocking {
            TokenManager.getToken(context).firstOrNull()
        }

        val originalRequest: Request = chain.request()
        val request = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        return chain.proceed(request)
    }
}

// ---------------------------------------------------------------------------
// Unauthorized Authenticator — fires on 401, clears the token, and broadcasts
// SESSION_EXPIRED so any registered receiver can redirect to PairingScreen.
// Returning null tells OkHttp to stop retrying (no retry loop).
// ---------------------------------------------------------------------------

const val ACTION_SESSION_EXPIRED = "com.sous.wearos.SESSION_EXPIRED"

class UnauthorizedAuthenticator(private val context: Context) : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? {
        Log.w("SousAuth", "401 Unauthorized – clearing token and broadcasting SESSION_EXPIRED")
        // Clear the stored token synchronously on IO thread
        runBlocking {
            TokenManager.clearToken(context)
        }
        // Broadcast so MainActivity (or any registered receiver) can navigate back to PairingScreen
        val intent = Intent(ACTION_SESSION_EXPIRED).apply {
            setPackage(context.packageName) // Explicit package for security on Android 8+
        }
        context.sendBroadcast(intent)
        // Return null → do NOT retry the request
        return null
    }
}

// ---------------------------------------------------------------------------
// ApiClient singleton factory — lazily initialised with application Context
// ---------------------------------------------------------------------------

object ApiClient {
    @Volatile
    private var _apiService: ApiService? = null

    /**
     * Must be called once from Application.onCreate() or before first use.
     * Subsequent calls are no-ops (double-checked locking).
     */
    fun init(context: Context) {
        if (_apiService != null) return
        synchronized(this) {
            if (_apiService != null) return

            val appContext = context.applicationContext

            val loggingInterceptor = HttpLoggingInterceptor { message ->
                Log.d("SousHttp", message)
            }.apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            }

            val okHttpClient = OkHttpClient.Builder()
                .addInterceptor(AuthInterceptor(appContext))      // ← injects token
                .authenticator(UnauthorizedAuthenticator(appContext)) // ← handles 401
                .addInterceptor(loggingInterceptor)
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .build()

            _apiService = Retrofit.Builder()
                .baseUrl(BuildConfig.API_BASE_URL)                // ← from build variant
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
    }

    /**
     * Returns the fully configured ApiService.
     * Throws if [init] has not been called yet — this surfaces misconfiguration fast.
     */
    val apiService: ApiService
        get() = _apiService
            ?: error("ApiClient not initialised. Call ApiClient.init(context) in Application.onCreate().")
}
