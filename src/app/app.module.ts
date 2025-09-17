import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'; // root module
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,      // already includes CommonModule for the root
    CommonModule,       // safe to include for feature modules (ok if duplicated)
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }