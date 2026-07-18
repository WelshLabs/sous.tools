package com.sous.wearos.presentation

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Icon
import com.sous.wearos.network.ACTION_SESSION_EXPIRED
import com.sous.wearos.network.ApiClient
import com.sous.wearos.network.CommandRequest
import com.sous.wearos.network.TokenManager
import com.sous.wearos.presentation.theme.SousToolsWearTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout

class MainActivity : ComponentActivity() {

    // -----------------------------------------------------------------------
    // 401 Broadcast Receiver — registered/unregistered with the activity
    // lifecycle to avoid leaks. On SESSION_EXPIRED the router will bounce
    // back to PairingScreen by clearing the local isPaired flag.
    // -----------------------------------------------------------------------
    private val sessionExpiredReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == ACTION_SESSION_EXPIRED) {
                Log.w("SousAuth", "SESSION_EXPIRED broadcast received — navigating to PairingScreen")
                // Restart the activity so MainAppRouter re-reads the (now null) token
                // and naturally falls into the PairingScreen branch.
                recreate()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setTheme(android.R.style.Theme_DeviceDefault)
        setContent {
            SousToolsWearTheme {
                MainAppRouter()
            }
        }
    }

    override fun onStart() {
        super.onStart()
        val filter = IntentFilter(ACTION_SESSION_EXPIRED)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(sessionExpiredReceiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(sessionExpiredReceiver, filter)
        }
    }

    override fun onStop() {
        super.onStop()
        unregisterReceiver(sessionExpiredReceiver)
    }
}

@Composable
fun MainAppRouter() {
    val context = LocalContext.current
    var isPaired by remember { mutableStateOf<Boolean?>(null) }

    LaunchedEffect(Unit) {
        val token = withContext(Dispatchers.IO) { TokenManager.getToken(context).firstOrNull() }
        isPaired = token != null
    }

    when (isPaired) {
        true  -> WearApp()
        false -> PairingScreen(onPaired = { isPaired = true })
        null  -> Box(modifier = Modifier.fillMaxSize().background(Color.Black)) // Loading
    }
}

@Composable
fun WearApp() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000000)),
        contentAlignment = Alignment.Center
    ) {
        VoiceTriggerButton()
    }
}

@Composable
fun VoiceTriggerButton() {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val speechRecognizerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val spokenText = result.data
                ?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                ?.firstOrNull()
            if (!spokenText.isNullOrEmpty()) {
                coroutineScope.launch {
                    sendToApi(context, spokenText)
                }
            }
        }
    }

    Button(
        onClick = {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            }
            speechRecognizerLauncher.launch(intent)
        },
        modifier = Modifier.size(120.dp),
        colors = ButtonDefaults.buttonColors(
            backgroundColor = Color(0xFF00FFFF),
            contentColor = Color(0xFF000000)
        )
    ) {
        Icon(
            painter = painterResource(id = android.R.drawable.ic_btn_speak_now),
            contentDescription = "Dirty Hands Voice Trigger",
            modifier = Modifier.size(64.dp)
        )
    }
}

// ---------------------------------------------------------------------------
// sendToApi — now uses the global AuthInterceptor; no manual token injection.
// Handles network failures gracefully (logs, no crash).
// A 401 is handled upstream by UnauthorizedAuthenticator and the broadcast
// receiver in MainActivity; we only need to guard against generic exceptions.
// ---------------------------------------------------------------------------
suspend fun sendToApi(context: Context, text: String) {
    // Verify we are actually paired before attempting the call
    val token = withContext(Dispatchers.IO) {
        TokenManager.getToken(context).firstOrNull()
    }
    if (token == null) {
        Log.w("SousCommand", "Skipping command — device is not paired")
        return
    }

    try {
        val response = withTimeout(10_000) {
            ApiClient.apiService.sendCommand(
                request = CommandRequest(
                    chatHistory = listOf(
                        com.sous.wearos.network.OmniMessage(
                            id = java.util.UUID.randomUUID().toString(),
                            role = "user",
                            content = text,
                            timestamp = java.time.Instant.now().toString()
                        )
                    ),
                    source = "wearos"
                )
            )
        }
        if (response.success) {
            Log.i("SousCommand", "Command accepted: ${response.data?.success}")
        } else {
            Log.w("SousCommand", "Command rejected by server: ${response.error}")
        }
    } catch (e: retrofit2.HttpException) {
        // Non-2xx response that isn't a 401 (401 is handled by the Authenticator)
        Log.e("SousCommand", "HTTP error ${e.code()}: ${e.message()}", e)
    } catch (e: java.net.SocketTimeoutException) {
        Log.e("SousCommand", "Command timed out — network may be unavailable", e)
    } catch (e: java.io.IOException) {
        Log.e("SousCommand", "Network error sending command", e)
    } catch (e: Exception) {
        Log.e("SousCommand", "Unexpected error sending command", e)
    }
}