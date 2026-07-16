package com.sous.wearos.complication

import android.util.Log
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.sous.wearos.network.ApiClient
import com.sous.wearos.network.TokenManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout

class TicketTimeComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) return null
        return createComplicationData("12m", "Ticket Time")
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        val token = withContext(Dispatchers.IO) {
            TokenManager.getToken(this@TicketTimeComplicationService).firstOrNull()
        }
        if (token == null) {
            return createComplicationData("Pair", "Ticket Time")
        }

        return try {
            // AuthInterceptor automatically injects the Bearer header
            val response = withTimeout(5000) { ApiClient.apiService.getTicketTimeMetrics() }
            createComplicationData(response.value, "Ticket Time")
        } catch (e: Exception) {
            Log.e("SousComplication", "TicketTime fetch failed", e)
            createComplicationData("Err", "Ticket Time")
        }
    }

    private fun createComplicationData(text: String, contentDescription: String) =
        ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text).build(),
            contentDescription = PlainComplicationText.Builder(contentDescription).build()
        ).build()
}
