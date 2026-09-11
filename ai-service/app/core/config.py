import shutil
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI Meeting Summarizer AI Service"
    APP_VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    SPRING_BOOT_URL: str = "http://localhost:8080"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TRANSCRIPTION_MODEL: str = "gemini-3.5-transcribe"
    MAX_AUDIO_FILE_SIZE_MB: int = 100
    TEMP_AUDIO_DIR: str = "./temp/audio"
    TEMP_VIDEO_DIR: str = "./temp/video"
    TRANSCRIPTION_ENABLE_DIARIZATION: bool = True
    TRANSCRIPTION_ENABLE_TIMESTAMPS: bool = True
    MAX_TRANSCRIPT_LENGTH: int = 100000

    # Phase 15 Video & FFmpeg configuration
    FFMPEG_PATH: str = "ffmpeg"
    FFMPEG_TIMEOUT_SECONDS: int = 600
    MAX_EXTRACTED_AUDIO_SIZE_MB: int = 500

    @property
    def max_audio_file_size_bytes(self) -> int:
        return self.MAX_AUDIO_FILE_SIZE_MB * 1024 * 1024

    @property
    def max_extracted_audio_size_bytes(self) -> int:
        return self.MAX_EXTRACTED_AUDIO_SIZE_MB * 1024 * 1024

    def get_resolved_ffmpeg_path(self) -> str:
        """Returns the configured or discovered absolute FFmpeg executable path."""
        # 1. If configured path is explicitly in PATH or is an existing absolute path
        if shutil.which(self.FFMPEG_PATH) or Path(self.FFMPEG_PATH).is_file():
            return self.FFMPEG_PATH

        # 2. Check common Windows winget installation path
        winget_fallback = Path.home() / "AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-essentials_build/bin/ffmpeg.exe"
        if winget_fallback.is_file():
            return str(winget_fallback)

        return self.FFMPEG_PATH

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
