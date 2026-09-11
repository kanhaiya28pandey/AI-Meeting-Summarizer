package com.meeting.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Value("${meeting.processing.core-pool-size:2}")
    private int corePoolSize;

    @Value("${meeting.processing.max-pool-size:4}")
    private int maxPoolSize;

    @Value("${meeting.processing.queue-capacity:20}")
    private int queueCapacity;

    @Value("${meeting.processing.thread-name-prefix:meeting-processing-}")
    private String threadNamePrefix;

    @Bean(name = "meetingProcessingExecutor")
    public Executor meetingProcessingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}
