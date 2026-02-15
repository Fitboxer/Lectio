import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') bgCanvas?: ElementRef<HTMLCanvasElement>;

  // ✅ Para que tu HTML pueda usar "authService.getUsername()"
  public authService: AuthService;

  // ✅ Para el footer: {{ currentYear }}
  public currentYear = new Date().getFullYear();

  private readonly isBrowser: boolean;

  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;

  private particles: Particle[] = [];
  private particleCount = 70;
  private linkDist = 140;

  constructor(
    authService: AuthService,
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.authService = authService;
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.zone.runOutsideAngular(() => {
      this.initCanvas();
      this.resizeCanvas();
      this.loop();
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null && this.isBrowser) {
      cancelAnimationFrame(this.rafId);
    }
  }

  // ✅ Para tu HTML: (click)="onProfileClick()"
  onProfileClick(): void {
    // Si está logueado -> perfil/biblioteca, si no -> login
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/biblioteca']); // cambia a '/perfil' si esa es tu ruta real
    } else {
      this.router.navigate(['/login']);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
  }

  private initCanvas(): void {
    const canvas = this.bgCanvas?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d');

    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.newParticle());
    }
  }

  private resizeCanvas(): void {
    const canvas = this.bgCanvas?.nativeElement;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(window.innerWidth);
    const h = Math.floor(window.innerHeight);

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  private loop(): void {
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  private draw(): void {
    const canvas = this.bgCanvas?.nativeElement;
    if (!canvas || !this.ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.ctx.clearRect(0, 0, w, h);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.linkDist) {
          const alpha = 1 - dist / this.linkDist;
          this.ctx.strokeStyle = `rgba(170, 145, 255, ${alpha * 0.25})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    for (const p of this.particles) {
      this.ctx.fillStyle = 'rgba(220, 210, 255, 0.85)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private newParticle(): Particle {
    const w = this.isBrowser ? window.innerWidth : 1200;
    const h = this.isBrowser ? window.innerHeight : 800;

    const speed = 0.22;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: 1.2 + Math.random() * 1.4
    };
  }

  // Si además quieres que al pulsar "Lectio" vuelva a inicio, usa routerLink="/"
  goHome(): void {
    this.router.navigate(['/']);
  }
}
