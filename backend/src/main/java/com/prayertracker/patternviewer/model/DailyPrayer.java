package com.prayertracker.patternviewer.model;

public enum DailyPrayer {
 SUBUH("Early morning prayer",2),
 ZUHR("Midday prayer",4),
 ASR("Late afternoon prayer",4),
 MAGHRIB("Sunset prayer",3),
 ISHA("Night prayer",4);

 private final String description;
 private final int rakaats;

 DailyPrayer(String d,int r){
  this.description=d;
  this.rakaats=r;
 }

 public String getDescription(){return description;}
 public int getRakaats(){return rakaats;}
}