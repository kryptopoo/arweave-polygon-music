import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

//Angular Material Components

import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from  '@angular/material/menu';
import { MatDialogModule } from  '@angular/material/dialog';
import { MatProgressBarModule } from  '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from  '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { HomeComponent } from './home/home.component';
import { WalletComponent } from './wallet/wallet.component';
import { YourLibraryComponent } from './your-library/your-library.component';
import { PlayerComponent } from './player/player.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlaylistComponent } from './playlist/playlist.component';
import { UploadComponent } from './upload/upload.component';
import { BundlrService } from './services/bundlr.service';
import { DataGridComponent } from './data-grid/data-grid.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { TopNavigationComponent } from './top-navigation/top-navigation.component';
import { TransactionLogsComponent } from './transaction-logs/transaction-logs.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    HomeComponent,
    WalletComponent,
    YourLibraryComponent,
    PlayerComponent,
    PlaylistComponent,
    UploadComponent,
    DataGridComponent,
    ConfirmDialogComponent,
    TopNavigationComponent,
    TransactionLogsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    MatButtonModule,
    MatListModule,
    MatSliderModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    AngularFireModule.initializeApp({
      apiKey: "AIzaSyBC6Zqa-nxEMf7VJ_DXUNhWLXGm01FT0fY",
      authDomain: "arpomus-9b99e.firebaseapp.com",
      projectId: "arpomus-9b99e",
      storageBucket: "arpomus-9b99e.appspot.com",
      messagingSenderId: "105151597866",
      appId: "1:105151597866:web:e28d4e9f18b832aef52253"
    }),
    AngularFirestoreModule
  ],
  providers: [BundlrService],
  bootstrap: [AppComponent],
})
export class AppModule {}
