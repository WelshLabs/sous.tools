package com.sous.wearos.presentation

import android.app.Activity
import android.content.Intent
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
import com.sous.wearos.network.ApiClient
import com.sous.wearos.network.CommandRequest
import com.sous.wearos.network.TokenManager
import com.sous.wearos.presentation.theme.SousToolsWearTheme
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.Dispatchers

class MainActivity : ComponentActivity() {
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
}

@Composable
fun MainAppRouter() {
    val context = LocalContext.current
    var isPaired by remember { mutableStateOf<Boolean?>(null) }
    
    LaunchedEffect(Unit) {
        val token = withContext(Dispatchers.IO) { TokenManager.getToken(context).firstOrNull() }
        isPaired = token != null
    }

    if (isPaired == true) {
        WearApp()
    } else if (isPaired == false) {
        PairingScreen(onPaired = { isPaired = true })
    } else {
        // Loading state (black screen)
        Box(modifier = Modifier.fillMaxSize().background(Color.Black))
    }
}

@Composable
fun WearApp() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000000)), // Dark background for Neon-Glass aesthetic
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
            val data = result.data
            val results = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val spokenText = results?.get(0)
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
        modifier = Modifier.size(120.dp), // Massive circular button for "Dirty Hands" tap
        colors = ButtonDefaults.buttonColors(
            backgroundColor = Color(0xFF00FFFF), // Cyan accents
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

suspend fun sendToApi(context: android.content.Context, text: String) {
    try {
        val token = withContext(Dispatchers.IO) { TokenManager.getToken(context).firstOrNull() }
        if (token != null) {
            val response = withTimeout(5000) {
                ApiClient.apiService.sendCommand(
                    authHeader = "Bearer $token",
                    request = CommandRequest(command = text, source = "wearos")
                )
            }
            if (response.success) {
                println("NestJS Command Success: ${response.data?.success}")
            } else {
                println("NestJS Command Failed: ${response.error}")
            }
        } else {
            println("Cannot send command: Unpaired.")
        }
    } catch (e: Exception) {
        Log.e("SousNetwork", "API Call Failed", e)
        e.printStackTrace()
    }
}