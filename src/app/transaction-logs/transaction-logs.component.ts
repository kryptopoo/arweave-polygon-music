import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BundlrService } from '../services/bundlr.service';

@Component({
  selector: 'app-transaction-logs',
  templateUrl: './transaction-logs.component.html',
  styleUrls: ['./transaction-logs.component.scss']
})
export class TransactionLogsComponent implements OnInit {

  transactions: any;

  constructor(private _firestore: AngularFirestore, private _bundlrService: BundlrService) { }

  ngOnInit(): void {
    var transactions = this._firestore.collection(`logs-${this._bundlrService.getAddress()}`).valueChanges().subscribe(trans => {
      this.transactions = trans;
    }); 
  }

}
