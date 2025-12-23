'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Production-grade search bar component
 * Provides real-time search for:
 * - Block heights and hashes
 * - Transaction IDs
 * - Addresses
 */
export function SearchBar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!query.trim() || query.length < 3) {
        return;
      }

      try {
        setLoading(true);

        // Use the search API
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const results = await response.json();

        // Redirect to first result found
        if (results.blocks && results.blocks.length > 0) {
          router.push(`/block/${results.blocks[0].hash}`);
        } else if (results.transactions && results.transactions.length > 0) {
          router.push(`/tx/${results.transactions[0].txid}`);
        } else if (results.addresses && results.addresses.length > 0) {
          router.push(`/address/${results.addresses[0].address}`);
        } else {
          // No results found
          alert('No results found for: ' + query);
        }
      } catch (error) {
        console.error('Search error:', error);
        alert('Search failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by block height, hash, transaction ID, or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || query.length < 3}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </form>
  );
}
