package com.sous.wearos.presentation.theme

import androidx.compose.runtime.Composable
import androidx.wear.compose.material.MaterialTheme
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors

val NeonCyan = Color(0xFF00FFFF)
val MidnightSlate = Color(0xFF18181B) // zinc-900

val wearColorPalette = Colors(
    primary = NeonCyan,
    primaryVariant = Color(0xFF00BFFF),
    secondary = NeonCyan,
    secondaryVariant = NeonCyan,
    background = MidnightSlate,
    surface = MidnightSlate,
    error = Color.Red,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = Color.White,
    onSurface = Color.White,
    onError = Color.Black
)

@Composable
fun SousToolsWearTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colors = wearColorPalette,
        content = content
    )
}