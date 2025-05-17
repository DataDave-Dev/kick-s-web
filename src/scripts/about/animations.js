function initAnimations() {
    Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("@studio-freight/lenis"),
    ])
        .then(([gsapModule, scrollTriggerModule, lenisModule]) => {
            const gsap = gsapModule.default || gsapModule;
            const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
            const Lenis = lenisModule.default || lenisModule;

            gsap.registerPlugin(ScrollTrigger);

            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: "vertical",
                gestureOrientation: "vertical",
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 2,
                infinite: false,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);

            gsap.to(".title-reveal", {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                onComplete: () => {
                    gsap.to(".title-reveal-bar", {
                        scaleX: 1,
                        opacity: 1,
                        duration: 0.6,
                        ease: "power3.inOut",
                    });
                },
            });

            gsap.to(".about-desc", {
                opacity: 1,
                y: 0,
                duration: 1.2,
                delay: 0.4,
                ease: "power2.out",
            });

            gsap.to(".timeline-section", {
                opacity: 1,
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: ".timeline-section",
                    start: "top 80%",
                },
            });

            gsap.to(".timeline-line", {
                scaleX: 1,
                duration: 1.5,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: ".timeline-section",
                    start: "top 75%",
                },
            });

            gsap.to(".values-title", {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: ".values-title",
                    start: "top 80%",
                },
            });

            const cards = document.querySelectorAll(".about-card");
            cards.forEach((card, index) => {
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: 0.15 * index,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    },
                });
            });
        })
        .catch((error) => {
            console.error("Error cargando las dependencias:", error);
        });
}

document.addEventListener("astro:page-load", initAnimations);
document.addEventListener("astro:after-swap", initAnimations);