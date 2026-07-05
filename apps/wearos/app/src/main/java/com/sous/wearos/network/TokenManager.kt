package com.sous.wearos.network

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.flowOn

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

object TokenManager {
    private val JWT_TOKEN_KEY = stringPreferencesKey("jwt_token")

    fun getToken(context: Context): Flow<String?> {
        return context.dataStore.data.map { preferences ->
            preferences[JWT_TOKEN_KEY]
        }.flowOn(Dispatchers.IO)
    }

    suspend fun saveToken(context: Context, token: String) {
        context.dataStore.edit { preferences ->
            preferences[JWT_TOKEN_KEY] = token
        }
    }
    
    suspend fun clearToken(context: Context) {
        context.dataStore.edit { preferences ->
            preferences.remove(JWT_TOKEN_KEY)
        }
    }
}
