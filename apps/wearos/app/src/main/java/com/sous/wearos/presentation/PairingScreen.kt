package com.sous.wearos.presentation

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text
import com.sous.wearos.network.ApiClient
import com.sous.wearos.network.PairInitRequest
import com.sous.wearos.network.TokenManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.Dispatchers

@Composable
fun PairingScreen(onPaired: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var pairingCode by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        while (isActive) {
            val currentCode = pairingCode
            if (currentCode == null) {
                try {
                    val response = withTimeout(5000) { ApiClient.apiService.initPairing(PairInitRequest()) }
                    if (response.success && response.data != null) {
                        pairingCode = response.data.code
                        errorMessage = null
                    } else {
                        errorMessage = response.error ?: "Failed to get code"
                    }
                } catch (e: Exception) {
                    Log.e("SousNetwork", "API Call Failed", e)
                    errorMessage = "Failed to init pairing: ${e.message}"
                }
            } else {
                try {
                    val statusResponse = withTimeout(5000) { ApiClient.apiService.checkPairingStatus(currentCode) }
                    if (statusResponse.success && statusResponse.data?.token != null) {
                        withContext(Dispatchers.IO) {
                            TokenManager.saveToken(context, statusResponse.data.token)
                        }
                        onPaired()
                        break
                    }
                    errorMessage = statusResponse.error
                } catch (e: Exception) {
                    Log.e("SousNetwork", "API Call Failed", e)
                    errorMessage = "Status check failed: ${e.message}"
                }
            }
            delay(5000)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(16.dp)
        ) {
            if (errorMessage != null) {
                Text(text = errorMessage ?: "", color = Color.Red)
            } else if (pairingCode == null) {
                CircularProgressIndicator(indicatorColor = Color(0xFF00FFFF))
            } else {
                Text(
                    text = pairingCode ?: "",
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF00FFFF), // Cyan
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Enter code at\nsous.tools/team",
                    fontSize = 14.sp,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
