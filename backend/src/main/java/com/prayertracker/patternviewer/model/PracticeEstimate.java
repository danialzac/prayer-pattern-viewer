package com.prayertracker.patternviewer.model;

public class PracticeEstimate {
 private final long performed;
 private final long remaining;
 private final double consistencyRate;

 public PracticeEstimate(long p,long r,double c){
  this.performed=p;
  this.remaining=r;
  this.consistencyRate=c;
 }

 public long getPerformed(){return performed;}
 public long getRemaining(){return remaining;}
 public double getConsistencyRate(){return consistencyRate;}
}