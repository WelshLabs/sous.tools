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
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.Dispatchers

class TicketTimeComplicationService : SuspendingComplicationDataSourceService() {
    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) return null
        return createComplicationData("12m", "Ticket Time")
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        var value = "Error"
        try {
            val token = withContext(Dispatchers.IO) { TokenManager.getToken(this@TicketTimeComplicationService).firstOrNull() }
            if (token != null) {
                val response = withTimeout(5000) { ApiClient.apiService.getTicketTimeMetrics("Bearer $token") }
                value = response.value
            } else {
                value = "Pair"
            }
        } catch (e: Exception) {
            Log.e("SousNetwork", "API Call Failed", e)
            e.printStackTrace()
        }
        return createComplicationData(value, "Ticket Time")
    }

    private fun createComplicationData(text: String, contentDescription: String) =
        ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text).build(),
            contentDescription = PlainComplicationText.Builder(contentDescription).build()
        ).build()
}
