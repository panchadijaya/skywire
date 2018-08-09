import {Component, Inject, OnChanges, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';
import { NodeService } from '../../../../../services/node.service';
import {DiscoveryAddress, Node, NodeDiscovery} from '../../../../../app.datatypes';
import {DatatableProvider} from "../../../../layout/datatable/datatable.component";
import {
  DiscoveryAddressInputComponent
} from "../../../../layout/discovery-address-input/discovery-address-input.component";
import {EditableDiscoveryAddressComponent} from "../../../../layout/editable-discovery-address/editable-discovery-address.component";

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit, OnChanges, DatatableProvider<DiscoveryAddress>
{
  form: FormGroup;
  node: Node;
  discoveries: NodeDiscovery;
  discoveryNodes: DiscoveryAddress[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ConfigurationComponent>,
    private nodeService: NodeService,
    private snackbar: MatSnackBar,
  ) {
    this.node = data.node;
    this.discoveries = data.discoveries;
    console.log(this.discoveries)
  }

  ngOnInit()
  {
    return Object.keys(this.discoveries).map(key => {
      const parts = key.split('-');

      this.discoveryNodes.push({
        domain: parts[0],
        publicKey: parts[1]
      })
    });

    /*this.form = new FormGroup({
      'addresses': new FormControl('', [this.validateAddresses])
    });*/
  }

  save(values: DiscoveryAddress[]) {
    /*if (!this.form.valid) {
      return;
    }*/

    let stringValues = [];
    values.map(({domain, publicKey}) =>
    {
        stringValues.push(`${domain}-${publicKey}`)
    });

    const config = {
      'discovery_addresses': stringValues,
    };

    const data = {
      key: this.node.key,
      data: JSON.stringify(config),
    };

    this.nodeService.setNodeConfig(data).subscribe(
      () => {
        this.nodeService.updateNodeConfig().subscribe(
          () => this.snackbar.open('Rebooting node, please wait.'),
          () => this.snackbar.open('Unable to reboot node.'),
        );
      },
      () => {
        this.snackbar.open('Unable to store node configuration.');
      }
    );
  }

  private validateAddresses(control: FormControl) {
    if (!control.value) {
      return null;
    }

    const isValid = !control.value.split(',')
      .map((address: string) => {
        const parts = address.split('-');

        if (parts.length !== 2) {
          return false;
        }

        const host = parts[0].split(':');

        if (host.length !== 2) {
          return false;
        }

        const port = parseInt(host[1], 10);

        if (isNaN(port) || port <= 0 || port > 65535) {
          return false;
        }

        if (parts[1].length !== 66) {
          return false;
        }
      })
      .some(result => result === false);

    return isValid ? null : { invalid: true };
  }

  getAddRowComponentClass()
  {
    return DiscoveryAddressInputComponent;
  }

  getAddRowData()
  {
    return {
      required: false
    };
  }

  getEditableRowComponentClass()
  {
    return EditableDiscoveryAddressComponent;
  }

  getEditableRowData(index: number, currentValue: DiscoveryAddress)
  {
    return {
      autofocus: true,
      value: currentValue
    };
  }

  ngOnChanges(): void {
    console.log('configuration onChanges');
  }
}
