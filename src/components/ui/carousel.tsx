import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

// New type for wheel effect options
type WheelEffectOptions = {
  perspective: string; // e.g., '1000px'
  itemRadius: number;   // For translateZ, e.g., 300
  slideAngle: number;  // Angle in degrees between slides, e.g., 30
  initialAngleOffset?: number; // Optional offset for the initial rotation of the wheel, e.g. to center first item
};

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  wheelEffectOptions?: WheelEffectOptions; // New prop
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  wheelEffectOptions?: WheelEffectOptions
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      wheelEffectOptions, // Destructure new prop
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
        skipSnaps: wheelEffectOptions ? true : opts?.skipSnaps, // Wheel effect often works better with free scrolling
        loop: wheelEffectOptions ? true : opts?.loop, // Loop is good for wheel
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }
      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      // Wheel effect logic
      if (wheelEffectOptions && api) {
        const { perspective, itemRadius, slideAngle, initialAngleOffset = 0 } = wheelEffectOptions;
        const contentNode = api.containerNode()?.children[0] as HTMLElement | undefined;
        const slideNodes = api.slideNodes();

        if (contentNode) {
          contentNode.style.transformStyle = "preserve-3d";
        }
        
        (carouselRef.current as HTMLElement)?.style.setProperty('perspective', perspective);


        const updateSlideTransforms = () => {
          if (!api) return;
          const engine = api.internalEngine();
          const scrollProgress = api.scrollProgress(); // This might need adjustment based on loop behavior
          
          // More direct access to target location for smoother interpolation during drag
          const target = engine.location.get();
          const position = target / engine.scroll συνολικού μήκους (scrollSnaps / total slides length)

          slideNodes.forEach((slideNode, index) => {
            // This is a simplified calculation. For a true wheel, we'd use target location directly.
            // scrollProgress gives overall progress, which we map to rotation.
            // The total rotation depends on the number of slides and angle per slide.
            // Let's assume a virtual "wheel" rotation.
            // A more robust way is to use the target position from engine.
            
            let angleForItem = (index * slideAngle) + initialAngleOffset;
            // Adjust angle based on scroll. Each full "scroll" of carousel length (e.g. 1 if not looping)
            // could correspond to rotating through all slides.
            // This part is tricky and depends on how `scrollProgress` is interpreted with `loop`.
            // For a simpler start, let's make the wheel rotate based on overall progress.
            // Total angle of the "wheel" if all slides were laid out: (slideNodes.length -1 ) * slideAngle
            // Current rotation of the wheel = scrollProgress * total_angle_span_of_all_slides

            // A common approach for wheel carousels:
            const rotationOffset = engine.scrollProgress.get(engine.location.get()) * (slideNodes.length * slideAngle);
            const itemTargetAngle = (index * slideAngle) - rotationOffset + initialAngleOffset;

            slideNode.style.transform = `translateZ(${itemRadius}px) rotateY(${itemTargetAngle}deg)`;
            
            // Optional: Add opacity or scale based on how far they are from the "front"
            const normalizedAngle = Math.abs(itemTargetAngle % 360);
            if (normalizedAngle > 90 && normalizedAngle < 270) { // Back-facing
              slideNode.style.opacity = '0.3';
            } else {
              slideNode.style.opacity = '1';
            }
          });
        };

        api.on("scroll", updateSlideTransforms);
        api.on("resize", updateSlideTransforms); // Re-calculate on resize
        api.on("reInit", updateSlideTransforms);
        updateSlideTransforms(); // Initial setup

        return () => {
          api.off("scroll", updateSlideTransforms);
          api.off("resize", updateSlideTransforms);
          api.off("reInit", updateSlideTransforms);
          // Reset styles if needed
           (carouselRef.current as HTMLElement)?.style.removeProperty('perspective');
          if (contentNode) contentNode.style.transformStyle = "";
          slideNodes.forEach(slide => {
            slide.style.transform = "";
            slide.style.opacity = "";
          });
        };
      }


      return () => {
        api?.off("select", onSelect)
        api?.off("reInit", onSelect) // Ensure reInit listener for onSelect is also cleaned up
      }
    }, [api, onSelect, wheelEffectOptions, carouselRef]); // Added carouselRef

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          wheelEffectOptions, // Pass down for context if needed, though not used by children currently
        }}
      >
        <div
          ref={ref} // This ref is for the outermost div, used by forwardRef
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden"> {/* This is embla.containerNode() */}
      <div
        ref={ref} // This ref is for the inner div, typically not needed by user
        className={cn(
          "flex", // This is embla.containerNode().children[0]
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation, wheelEffectOptions } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        // Add transition for smooth transform changes if wheel effect is active
        wheelEffectOptions ? "transition-transform duration-500 ease-out" : "",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
