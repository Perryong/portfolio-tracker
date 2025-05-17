
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetType } from "@/types";
import { popularStocks, validateStockSymbol } from "@/services/stockService";
import { popularCryptos } from "@/services/cryptoService";
import { usePortfolioStore } from "@/store/portfolioStore";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetType: AssetType;
}

export function AddAssetDialog({ open, onOpenChange, assetType }: AddAssetDialogProps) {
  const [selectedAsset, setSelectedAsset] = useState<{
    ticker: string;
    name: string;
  } | null>(null);
  
  const [searchMode, setSearchMode] = useState<'popular' | 'custom'>('popular');
  const [customSymbol, setCustomSymbol] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [symbolError, setSymbolError] = useState<string>("");
  
  const [quantity, setQuantity] = useState<string>("");
  const [avgCost, setAvgCost] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { addAsset } = usePortfolioStore();
  const { toast } = useToast();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  // Handle custom symbol validation
  const handleCustomSymbolValidation = async () => {
    if (!customSymbol) {
      setSymbolError("Please enter a symbol");
      return false;
    }
    
    const symbol = customSymbol.toUpperCase().trim();
    setIsValidating(true);
    setSymbolError("");
    
    try {
      const validation = await validateStockSymbol(symbol);
      
      if (validation.valid) {
        setSelectedAsset({
          ticker: symbol,
          name: validation.name || `${symbol} Stock`,
        });
        setSymbolError("");
        setIsValidating(false);
        return true;
      } else {
        setSymbolError(`Could not validate symbol "${symbol}". Please check and try again.`);
        setIsValidating(false);
        return false;
      }
    } catch (error) {
      console.error("Error validating symbol:", error);
      setSymbolError("An error occurred while validating the symbol");
      setIsValidating(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let validSymbol = selectedAsset !== null;
    
    // If in custom mode but no selection yet
    if (searchMode === 'custom' && !selectedAsset && customSymbol) {
      validSymbol = await handleCustomSymbolValidation();
    }
    
    if (validSymbol && selectedAsset && quantity) {
      const parsedQuantity = parseFloat(quantity);
      const parsedAvgCost = avgCost ? parseFloat(avgCost) : undefined;
      
      if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
        addAsset({
          ticker: selectedAsset.ticker,
          name: selectedAsset.name,
          type: assetType,
          quantity: parsedQuantity,
          avgCost: parsedAvgCost,
        });
        
        // Show success toast
        toast({
          title: "Asset added",
          description: `Added ${selectedAsset.ticker} to your portfolio`,
        });
        
        // Reset form
        setSelectedAsset(null);
        setCustomSymbol("");
        setQuantity("");
        setAvgCost("");
        setSearchMode('popular');
        onOpenChange(false);
      }
    }
  };

  // Get the appropriate asset list based on type
  const assetList = assetType === "stock" ? popularStocks : popularCryptos;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {assetType === "stock" ? "Stock" : "Cryptocurrency"}</DialogTitle>
          <DialogDescription>
            {searchMode === 'popular' 
              ? `Select from popular ${assetType === "stock" ? "stocks" : "cryptocurrencies"} or enter a symbol directly.` 
              : `Enter any ${assetType === "stock" ? "stock" : "crypto"} symbol.`}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Stock specific UI with tabs */}
          {assetType === "stock" && (
            <Tabs 
              value={searchMode} 
              onValueChange={(value) => setSearchMode(value as 'popular' | 'custom')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4 w-full">
                <TabsTrigger value="popular">Popular Stocks</TabsTrigger>
                <TabsTrigger value="custom">Custom Symbol</TabsTrigger>
              </TabsList>
              
              <TabsContent value="popular" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="asset">Select Stock</Label>
                  <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={dropdownOpen}
                        className="w-full justify-between"
                      >
                        {selectedAsset ? `${selectedAsset.ticker} - ${selectedAsset.name}` : `Select ${assetType}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder={`Search popular ${assetType}...`} />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {popularStocks.map((asset) => (
                              <CommandItem
                                key={asset.ticker}
                                value={`${asset.ticker} ${asset.name}`}
                                onSelect={() => {
                                  setSelectedAsset(asset);
                                  setDropdownOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedAsset?.ticker === asset.ticker
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="font-medium">{asset.ticker}</span> - {asset.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="mt-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customSymbol">Enter symbol directly</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="customSymbol"
                      placeholder="e.g. NIO, SOXL"
                      value={customSymbol}
                      onChange={(e) => {
                        setCustomSymbol(e.target.value.toUpperCase());
                        setSymbolError("");
                      }}
                      className="flex-1"
                      ref={initialFocusRef}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCustomSymbolValidation}
                      disabled={isValidating || !customSymbol}
                    >
                      {isValidating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Validate
                    </Button>
                  </div>
                  {symbolError && (
                    <p className="text-sm text-red-500">{symbolError}</p>
                  )}
                  {selectedAsset && customSymbol === selectedAsset.ticker && (
                    <p className="text-sm text-green-500">
                      Symbol validated: {selectedAsset.name}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {/* Crypto specific UI */}
          {assetType === "crypto" && (
            <div className="space-y-2">
              <Label htmlFor="asset">Select Cryptocurrency</Label>
              <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dropdownOpen}
                    className="w-full justify-between"
                  >
                    {selectedAsset ? `${selectedAsset.ticker} - ${selectedAsset.name}` : "Select cryptocurrency"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search cryptocurrencies..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {popularCryptos.map((asset) => (
                          <CommandItem
                            key={asset.ticker}
                            value={`${asset.ticker} ${asset.name}`}
                            onSelect={() => {
                              setSelectedAsset(asset);
                              setDropdownOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedAsset?.ticker === asset.ticker
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="font-medium">{asset.ticker}</span> - {asset.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          {/* Common UI elements (quantity, avg cost, buttons) */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="any"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avgCost">Average Cost (optional)</Label>
            <Input
              id="avgCost"
              type="number"
              min="0"
              step="any"
              placeholder="Cost per share/coin"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={(searchMode === 'custom' && !selectedAsset && !customSymbol) || !quantity}
            >
              Add to Portfolio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
