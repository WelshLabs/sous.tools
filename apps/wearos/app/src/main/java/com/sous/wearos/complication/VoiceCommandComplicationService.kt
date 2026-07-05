package com.sous.wearos.complication

import android.app.PendingIntent
import android.content.Intent
import android.graphics.drawable.Icon
import androidx.wear.watchface.complications.data.*
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.sous.wearos.R
import com.sous.wearos.presentation.MainActivity

class VoiceCommandComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.MONOCHROMATIC_IMAGE) {
            return null
        }
        return createComplicationData()
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        return createComplicationData()
    }

    private fun createComplicationData(): ComplicationData {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return MonochromaticImageComplicationData.Builder(
            monochromaticImage = MonochromaticImage.Builder(
                image = Icon.createWithResource(this, R.drawable.ic_chef_hat)
            ).build(),
            contentDescription = PlainComplicationText.Builder("Voice Command").build()
        )
        .setTapAction(pendingIntent)
        .build()
    }
}
