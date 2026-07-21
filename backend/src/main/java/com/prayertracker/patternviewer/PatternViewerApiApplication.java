package com.prayertracker.patternviewer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PatternViewerApiApplication {
 //! This is the backend starting point. Running this class boots the whole Spring app.
 //! Ni titik mula backend. Bila run class ni, seluruh app Spring akan hidup.
 public static void main(String[] args) {
  SpringApplication.run(PatternViewerApiApplication.class, args);
 }
}
