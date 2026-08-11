import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBubblesComponent } from './my-bubbles.component';

describe('MyBubblesComponent', () => {
  let component: MyBubblesComponent;
  let fixture: ComponentFixture<MyBubblesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBubblesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBubblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
