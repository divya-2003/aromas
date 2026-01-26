import { motion } from "framer-motion";
import { MapPin, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/useLocation";

interface LocationGateProps {
  children: React.ReactNode;
}

export function LocationGate({ children }: LocationGateProps) {
  const {
    isWithinPremises,
    isLoading,
    error,
    distance,
    hasPermission,
    refreshLocation,
    allowedRadius,
    collegeName,
  } = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <div className="rounded-full bg-primary/10 p-4">
          <MapPin className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold">Checking your location...</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please allow location access when prompted
          </p>
        </div>
      </motion.div>
    );
  }

  // Error state or permission denied
  if (error || hasPermission === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold">Location Access Required</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {error || "Please enable location services to place orders"}
          </p>
        </div>
        <Button onClick={refreshLocation} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <p className="text-xs text-muted-foreground">
          Ordering is only available within the college campus
        </p>
      </motion.div>
    );
  }

  // Outside premises
  if (!isWithinPremises) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <div className="rounded-full bg-amber-500/10 p-4">
          <MapPin className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h3 className="font-semibold">Outside College Premises</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            You're currently {distance ? `${distance}m` : "too far"} from the campus.
            Orders can only be placed within {allowedRadius}m of {collegeName}.
          </p>
        </div>
        <Button onClick={refreshLocation} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Check Again
        </Button>
        <p className="text-xs text-muted-foreground">
          Please move closer to the college to place your order
        </p>
      </motion.div>
    );
  }

  // Within premises - show children
  return <>{children}</>;
}

export function LocationBadge() {
  const { isWithinPremises, isLoading, distance, collegeName } = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 animate-pulse" />
        <span>Checking location...</span>
      </div>
    );
  }

  if (isWithinPremises) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600">
        <CheckCircle className="h-3 w-3" />
        <span>Within {collegeName} ({distance}m away)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-600">
      <AlertTriangle className="h-3 w-3" />
      <span>Outside campus ({distance}m away)</span>
    </div>
  );
}
