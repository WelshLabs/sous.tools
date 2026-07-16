package com.sous.wearos

import android.app.Application
import com.sous.wearos.network.ApiClient

/**
 * Custom Application class.
 * Initialises the ApiClient singleton with the application context
 * so the AuthInterceptor and UnauthorizedAuthenticator have a stable
 * context reference for DataStore access throughout the app's lifetime.
 *
 * Registered in AndroidManifest.xml via android:name=".SousApplication"
 */
class SousApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        ApiClient.init(this)
    }
}
