import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Node, NodeApp} from "../../../../../app.datatypes";
import {LogComponent} from "../log/log.component";
import {MatDialog} from "@angular/material";

@Component({
  selector: 'app-node-app-button',
  templateUrl: './node-app-button.component.html',
  styleUrls: ['./node-app-button.component.scss']
})
export abstract class NodeAppButtonComponent implements OnChanges {
  protected title: string;
  protected icon: string;
  @Input() enabled: boolean = true;
  @Input() subtitle: string;
  @Input() active: boolean = false;
  @Input() hasMessages: boolean = false;
  @Input() showMore: boolean = true;
  @Input() node: Node;
  @Input() app: NodeApp | null;
  @Output() onClick: EventEmitter<any> = new EventEmitter();
  private containerClass: string;
  protected menuItems: MenuItem[] = [];

  constructor(private _dialog: MatDialog) {
  }

  handleClick(): void {
    this.onClick.emit();
  }

  get isRunning(): boolean {
    return !!this.app;
  }

  showLog() {
    this._dialog.open(LogComponent, {
      data: {
        app: this.app,
      },
    });
  }

  ngOnChanges(): void {
    this.containerClass = `${"d-flex flex-column align-items-center justify-content-center w-100"} ${this.isRunning ? 'active' : ''}`
    this.menuItems = this.getMenuItems();
  }

  protected abstract getMenuItems(): MenuItem[];
}

export interface MenuItem
{
  name: string;
  callback: Function;
  enabled: boolean;
}
