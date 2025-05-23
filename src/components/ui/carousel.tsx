import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaCarouselType as CarouselApi } from "embla-carousel"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext<CarouselApi | null>(null)

// Add a hook to use the carousel context
function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel provider")
  }
  return context
}

interface CarouselProps extends React.HTMLAttributes<HTMLElement> {
  opts?: Parameters<typeof useEmblaCarousel>[0]
  children: React.ReactNode
  onCreated?: (api: CarouselApi) => void
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, opts, children, onCreated, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(opts)

    React.useEffect(() => {
      if (emblaApi && onCreated) {
        onCreated(emblaApi)
      }
    }, [emblaApi, onCreated])

    return (
      <CarouselContext.Provider value={emblaApi}>
        <div className={cn("relative", className)} {...props} ref={ref}>
          <div ref={emblaRef} className="overflow-hidden">
            {children}
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
  return <div 
    className={cn("flex", className)}
    data-embla="viewport"
    {...props} 
    ref={ref} 
  />
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("min-w-0 shrink-0 grow-0 px-2", className)}
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
        "absolute top-1/2 z-10 -translate-y-1/2 left-4 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-0 shadow-md",
        className
      )}
      onClick={() => embla?.scrollPrev()}
      disabled={!embla}
      {...props}
    >
      <ChevronLeft className="h-5 w-5" />
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
        "absolute top-1/2 z-10 -translate-y-1/2 right-4 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-0 shadow-md",
        className
      )}
      onClick={() => embla?.scrollNext()}
      disabled={!embla}
      {...props}
    >
      <ChevronRight className="h-5 w-5" />
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
  useCarousel,
}
