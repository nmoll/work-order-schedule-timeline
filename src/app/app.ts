import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidePanelComponent } from './shared/ui/side-panel/side-panel.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidePanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
