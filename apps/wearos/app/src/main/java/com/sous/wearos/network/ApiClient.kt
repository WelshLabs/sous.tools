package com.sous.wearos.network

import com.sous.wearos.BuildConfig
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Body
import retrofit2.http.Path

// Generic API Response wrapper for NestJS controllers using runControllerAction
data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: String?,
    val timestamp: String?
)

data class MetricsResponse(
    val value: String
)

data class PairInitRequest(val deviceType: String = "wearos")
data class PairInitResponse(val code: String)
data class PairStatusResponse(
    val status: String,
    val token: String?
)

data class CommandRequest(val command: String, val source: String = "wearos")
data class CommandResponse(val success: Boolean)

interface ApiService {
    @GET("/metrics/sales")
    suspend fun getSalesMetrics(
        @Header("Authorization") authHeader: String
    ): MetricsResponse

    @GET("/metrics/ticket-time")
    suspend fun getTicketTimeMetrics(
        @Header("Authorization") authHeader: String
    ): MetricsResponse

    @POST("/devices/pair/init")
    suspend fun initPairing(@Body request: PairInitRequest): ApiResponse<PairInitResponse>

    @GET("/devices/pair/status/{code}")
    suspend fun checkPairingStatus(@Path("code") code: String): ApiResponse<PairStatusResponse>

    @POST("/commands")
    suspend fun sendCommand(
        @Header("Authorization") authHeader: String,
        @Body request: CommandRequest
    ): ApiResponse<CommandResponse>
}

object ApiClient {
    private val retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}
