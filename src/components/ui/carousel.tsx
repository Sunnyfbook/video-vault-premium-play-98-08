
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { type EmblaCarouselType as CarouselApi } from "embla-carousel"
import { type EmblaOptionsType as CarouselOptions } from "embla-carousel"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext<CarouselApi | null>(null)

interface CarouselProps extends React.HTMLAttributes<HTMLElement> {
  opts?: CarouselOptions
  children: React.ReactNode
}

const Carousel = React.forwardRef<HTMLElement, CarouselProps>(
  ({ className, opts, children, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(opts)

    React.useEffect(() => {
      if (!emblaApi) return

      // Your carousel logic here
    }, [emblaApi])

    return (
      <CarouselContext.Provider value={emblaApi}>
        <div className={cn("relative", className)} {...props}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">{children}</div>
          </div>
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
  return <div className={cn("flex gap-1", className)} {...props} ref={ref} />
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5", className)}
      {...props}
      ref={ref}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

interface CarouselNavProps extends React.HTMLAttributes<HTMLButtonElement> {
  // We removed the direction requirement since we determine direction by component
}

function CarouselPrevious({ className, ...props }: CarouselNavProps) {
  const embla = React.useContext(CarouselContext)

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 left-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
      onClick={() => embla?.scrollPrev()}
      disabled={!embla}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous</span>
    </Button>
  )
}
CarouselPrevious.displayName = "CarouselPrevious"

function CarouselNext({ className, ...props }: CarouselNavProps) {
  const embla = React.useContext(CarouselContext)

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
      onClick={() => embla?.scrollNext()}
      disabled={!embla}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next</span>
    </Button>
  )
}
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
