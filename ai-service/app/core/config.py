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
    TRANSCRIPTION_ENABLE_DIARIZATION: bool = True
    TRANSCRIPTION_ENABLE_TIMESTAMPS: bool = True

    @property
    def max_audio_file_size_bytes(self) -> int:
        return self.MAX_AUDIO_FILE_SIZE_MB * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
