import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DomSanitizer } from '@angular/platform-browser';

import { MatIconRegistry } from '@angular/material/icon';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let nativeElement: HTMLElement;

  // Mock for MatIconRegistry to prevent network requests for SVGs
  const matIconRegistryMock = {
    addSvgIcon: jasmine.createSpy('addSvgIcon').and.returnValue(null),
    // Add any other methods your component might call
  };

  // Mock for DomSanitizer
  const domSanitizerMock = {
    bypassSecurityTrustResourceUrl: jasmine.createSpy('bypassSecurityTrustResourceUrl').and.callFake(url => url),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,       // Import the standalone component
        NoopAnimationsModule // Disable animations for tests
      ],
      providers: [
        { provide: MatIconRegistry, useValue: matIconRegistryMock },
        { provide: DomSanitizer, useValue: domSanitizerMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement as HTMLElement;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main toolbar with the correct title', () => {
    fixture.detectChanges();
    const toolbar = nativeElement.querySelector('.main-toolbar span');
    expect(toolbar?.textContent).toContain('MaxText: High-Performance LLM');
  });

  it('should call registerIcons on construction', () => {
    expect(matIconRegistryMock.addSvgIcon).toHaveBeenCalledWith('github', 'assets/github.svg');
  });

  it('should populate table data sources on ngOnInit', () => {
    // Check that data is empty before ngOnInit
    expect(component.tpuV5pDataSource.data.length).toBe(0);
    expect(component.tpuV5eDataSource.data.length).toBe(0);

    // Trigger ngOnInit
    fixture.detectChanges();

    // Check that data sources are now populated
    expect(component.tpuV5pDataSource.data.length).toBeGreaterThan(0);
    expect(component.tpuV5pDataSource.data.length).toBe(10); // Based on getTpuV5pData method
    expect(component.tpuV5eDataSource.data.length).toBeGreaterThan(0);
    expect(component.tpuV5eDataSource.data.length).toBe(6); // Based on getTpuV5eData method
  });

  it('should have chart containers present in the template', () => {
    fixture.detectChanges();
    const v5pContainer = nativeElement.querySelector('[data-testid="v5p-chart-container"]');
    const v5eContainer = nativeElement.querySelector('[data-testid="v5e-chart-container"]');

    expect(v5pContainer).toBeDefined();
    expect(v5eContainer).toBeDefined();

    // Note: We can't directly test the Google Chart drawing in a unit test,
    // but we can verify that the containers for them are rendered.
    // For this, let's add data-testid attributes to the HTML.
    // **Action:** Add `data-testid` to your `app.component.html` chart divs for this test to pass.
    // e.g., `<div #v5pChartContainer data-testid="v5p-chart-container"></div>`
  });

  it('should show the loading spinner initially and hide it when charts are ready', () => {
    component.chartsReady = false;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.chart-loader')).not.toBeNull();
    expect(nativeElement.querySelector('.charts-grid')?.hasAttribute('hidden')).toBeTrue();

    component.chartsReady = true;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.chart-loader')).toBeNull();
    expect(nativeElement.querySelector('.charts-grid')?.hasAttribute('hidden')).toBeFalse();
  });
});
