'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const currencyPairs = {
  'EUR/USD': { decimals: 5, standardLot: 100000 },
  'GBP/USD': { decimals: 5, standardLot: 100000 },
  'USD/JPY': { decimals: 3, standardLot: 100000 },
  'USD/CHF': { decimals: 5, standardLot: 100000 },
  'AUD/USD': { decimals: 5, standardLot: 100000 },
  'USD/CAD': { decimals: 5, standardLot: 100000 },
}

export default function ForexCalculator() {
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [volume, setVolume] = useState('')
  const [selectedPair, setSelectedPair] = useState('EUR/USD')
  const [positionType, setPositionType] = useState('buy')
  const [result, setResult] = useState({ pips: null, profitLoss: null })
  const [error, setError] = useState('')

  const calculateLevels = () => {
    setError('')
    const entry = parseFloat(entryPrice)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    const tradeVolume = parseFloat(volume)

    if (isNaN(entry) || isNaN(sl) || isNaN(tp) || isNaN(tradeVolume)) {
      setError('Please enter valid numbers for all fields.')
      return
    }

    if (entry <= 0 || sl <= 0 || tp <= 0 || tradeVolume <= 0) {
      setError('All values must be greater than zero.')
      return
    }

    if (positionType === 'buy' && (sl >= entry || tp <= entry)) {
      setError('For a buy position, Stop Loss must be below Entry Price and Take Profit above.')
      return
    }

    if (positionType === 'sell' && (sl <= entry || tp >= entry)) {
      setError('For a sell position, Stop Loss must be above Entry Price and Take Profit below.')
      return
    }

    const { decimals, standardLot } = currencyPairs[selectedPair]
    const pipValue = selectedPair.includes('JPY') ? 0.01 : 0.0001
    const slPips = Math.abs((entry - sl) / pipValue)
    const tpPips = Math.abs((tp - entry) / pipValue)

    const unitSize = tradeVolume * standardLot
    let potentialLoss, potentialProfit

    if (positionType === 'buy') {
      potentialLoss = (entry - sl) * unitSize
      potentialProfit = (tp - entry) * unitSize
    } else {
      potentialLoss = (sl - entry) * unitSize
      potentialProfit = (entry - tp) * unitSize
    }

    setResult({
      pips: {
        stopLoss: slPips.toFixed(1),
        takeProfit: tpPips.toFixed(1)
      },
      profitLoss: {
        potential_loss: (-potentialLoss).toFixed(2),
        potential_profit: potentialProfit.toFixed(2)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-black text-2xl font-bold mb-6 text-center">Forex Calculator</h1>
        <div className="space-y-4">
          <div>
            <Label className="text-black" htmlFor="currencyPair">Currency Pair</Label>
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger id="currencyPair" className="text-black">
                <SelectValue placeholder="Select currency pair" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(currencyPairs).map((pair) => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-black">Position Type</Label>
            <RadioGroup defaultValue="buy" onValueChange={setPositionType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy" id="buy" />
                <Label className="text-black" htmlFor="buy">Buy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell" id="sell" />
                <Label className="text-black" htmlFor="sell">Sell</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-black" htmlFor="entryPrice">Entry Price</Label>
            <Input
              className="text-black"
              id="entryPrice"
              type="number"
              step={selectedPair.includes('JPY') ? '0.001' : '0.00001'}
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder={`Enter price (e.g., ${selectedPair.includes('JPY') ? '110.000' : '1.10000'})`}
            />
          </div>
          <div>
            <Label className="text-black" htmlFor="stopLoss">Stop Loss</Label>
            <Input
              className="text-black"
              id="stopLoss"
              type="number"
              step={selectedPair.includes('JPY') ? '0.001' : '0.00001'}
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Enter stop loss price"
            />
          </div>
          <div>
            <Label className="text-black" htmlFor="takeProfit">Take Profit</Label>
            <Input
              className="text-black"
              id="takeProfit"
              type="number"
              step={selectedPair.includes('JPY') ? '0.001' : '0.00001'}
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Enter take profit price"
            />
          </div>
          <div>
            <Label className="text-black" htmlFor="volume">Volume (Lots)</Label>
            <Input
              className="text-black"
              id="volume"
              type="number"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="Enter volume (e.g., 0.1 for mini lot)"
            />
          </div>
          <Button onClick={calculateLevels} className="w-full">Calculate</Button>
        </div>
        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}
        {result.pips && result.profitLoss && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h2 className="text-black text-lg font-semibold mb-2">Results:</h2>
            <p className="text-black"><strong>Stop Loss:</strong> {stopLoss} ({result.pips.stopLoss} pips)</p>
            <p className="text-black"><strong>Take Profit:</strong> {takeProfit} ({result.pips.takeProfit} pips)</p>
            <p className="text-red-500"><strong>Potential Loss:</strong> ${result.profitLoss.potential_loss}</p>
            <p className="text-green-500"><strong>Potential Profit:</strong> ${result.profitLoss.potential_profit}</p>
          </div>
        )}
      </div>
    </div>
  )
}