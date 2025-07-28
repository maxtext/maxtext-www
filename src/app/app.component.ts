import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeferTriggerComponent } from './defer-trigger.component'; // Import the new component

// This lets TypeScript know `google` will exist as a global variable at runtime
declare var google: any;

// --- Interfaces for Type-Safe Table Data ---
export interface TpuV5pPerformance {
  params: string;
  accelerator: string;
  tflops: number;
  mfu: number;
}

export interface TpuV5ePerformance {
  hardware: string;
  mfu_16b: number;
  mfu_32b: number;
  mfu_64b: number;
  mfu_128b: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule, MatTabsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatListModule, MatDividerModule, MatTableModule, MatProgressBarModule,
    MatExpansionModule, MatProgressSpinnerModule,
    DeferTriggerComponent, // Add the trigger component to imports
  ],
})
export class AppComponent implements OnInit {
  // These are queried only AFTER the defer block renders its content
  @ViewChild('v5pChartContainer') v5pChartContainer!: ElementRef;
  @ViewChild('v5eChartContainer') v5eChartContainer!: ElementRef;

  // Static flag to ensure the Google Charts script is only loaded once
  private static googleChartsLoaded = false;

  // --- TPU v5p Table Properties ---
  tpuV5pDisplayedColumns: string[] = ['params', 'accelerator', 'tflops', 'mfu'];
  tpuV5pDataSource = new MatTableDataSource<TpuV5pPerformance>();

  // --- TPU v5e Table Properties ---
  tpuV5eDisplayedColumns: string[] = ['hardware', 'mfu_16b', 'mfu_32b', 'mfu_64b', 'mfu_128b'];
  tpuV5eDataSource = new MatTableDataSource<TpuV5ePerformance>();

  private v5pChartData: TpuV5pPerformance[] = [];
  private v5eChartData: TpuV5ePerformance[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  ngOnInit(): void {
    // Prepare data, but do not attempt to draw charts yet.
    this.v5pChartData = this.getTpuV5pData();
    this.tpuV5pDataSource.data = this.v5pChartData;
    this.v5eChartData = this.getTpuV5eData();
    this.tpuV5eDataSource.data = this.v5eChartData;
  }

  /**
   * This method is triggered by the (loaded) event from our app-defer-trigger component.
   */
  onChartsLoaded(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleCharts();
    }
  }

  private loadGoogleCharts(): void {
    if (AppComponent.googleChartsLoaded) {
      this.initializeCharts();
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      AppComponent.googleChartsLoaded = true;
      google.charts.load('current', { packages: ['bar'] });
      google.charts.setOnLoadCallback(() => this.initializeCharts());
    };
    document.head.appendChild(script);
  }

  private initializeCharts(): void {
    this.drawV5pChart();
    this.drawV5eChart();
  }

  private drawV5pChart(): void {
    const data = google.visualization.arrayToDataTable([
      ['Model & Accelerator', 'MFU (%)'],
      ...this.v5pChartData.map(item => [`${item.params} (${item.accelerator})`, item.mfu])
    ]);

    const options = {
      legend: { position: 'none' },
      backgroundColor: 'transparent',
      chartArea: { backgroundColor: 'transparent', left: 60, top: 20, width: '90%', height: '70%' },
      hAxis: { title: 'Model and Accelerator' },
      vAxis: { title: 'MFU (%)', minValue: 0, gridlines: { count: 5 } },
      colors: ['#4285F4'],
    };

    const chart = new google.charts.Bar(this.v5pChartContainer.nativeElement);
    chart.draw(data, google.charts.Bar.convertOptions(options));
  }

  private drawV5eChart(): void {
    const data = google.visualization.arrayToDataTable([
      ['Hardware', '16B MFU', '32B MFU', '64B MFU', '128B MFU'],
      ...this.v5eChartData.map(item => [item.hardware, item.mfu_16b, item.mfu_32b, item.mfu_64b, item.mfu_128b])
    ]);

    const options = {
      legend: { position: 'bottom' },
      backgroundColor: 'transparent',
      chartArea: { backgroundColor: 'transparent', left: 60, top: 20, width: '90%', height: '65%' },
      hAxis: { title: 'Hardware Configuration' },
      vAxis: { title: 'MFU (%)', minValue: 40, gridlines: { count: 5 } },
    };

    const chart = new google.charts.Bar(this.v5eChartContainer.nativeElement);
    chart.draw(data, google.charts.Bar.convertOptions(options));
  }

  private registerIcons(): void {
    this.matIconRegistry.addSvgIcon(
      'github',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/github.svg')
    );
  }

  private getTpuV5pData(): TpuV5pPerformance[] {
    return [{ params: '32B', accelerator: 'v5p-128', tflops: 3.28e+02, mfu: 67.76 }, {
      params: '64B',
      accelerator: 'v5p-128',
      tflops: 3.23e+02,
      mfu: 70.31
    }, { params: '128B', accelerator: 'v5p-256', tflops: 3.15e+02, mfu: 68.68 }, {
      params: '128B',
      accelerator: 'v5p-512',
      tflops: 3.15e+02,
      mfu: 68.53
    }, { params: '256B', accelerator: 'v5p-1024', tflops: 3.16e+02, mfu: 68.82 }, {
      params: '512B',
      accelerator: 'v5p-1024',
      tflops: 2.94e+02,
      mfu: 63.99
    }, { params: '1024B', accelerator: 'v5p-2048', tflops: 2.49e+02, mfu: 64.05 }, {
      params: '1024B',
      accelerator: 'v5p-4096',
      tflops: 2.97e+02,
      mfu: 64.80
    }, { params: '1160B', accelerator: 'v5p-7680', tflops: 2.95e+02, mfu: 64.27 }, {
      params: '1160B',
      accelerator: 'v5p-12288',
      tflops: 3.04e+02,
      mfu: 66.23
    },];
  }

  private getTpuV5eData(): TpuV5ePerformance[] {
    return [{
      hardware: '1x v5e-256',
      mfu_16b: 61.10,
      mfu_32b: 66.86,
      mfu_64b: 59.90,
      mfu_128b: 56.06
    }, {
      hardware: '2x v5e-256',
      mfu_16b: 59.37,
      mfu_32b: 64.81,
      mfu_64b: 56.66,
      mfu_128b: 55.82
    }, {
      hardware: '4x v5e-256',
      mfu_16b: 59.14,
      mfu_32b: 64.10,
      mfu_64b: 55.85,
      mfu_128b: 54.93
    }, {
      hardware: '8x v5e-256',
      mfu_16b: 58.27,
      mfu_32b: 63.67,
      mfu_64b: 54.96,
      mfu_128b: 52.93
    }, {
      hardware: '16x v5e-256',
      mfu_16b: 56.56,
      mfu_32b: 62.26,
      mfu_64b: 53.29,
      mfu_128b: 50.86
    }, { hardware: '32x v5e-256', mfu_16b: 54.65, mfu_32b: 60.40, mfu_64b: 50.18, mfu_128b: 46.25 },];
  }
}
