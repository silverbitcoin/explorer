import { SearchBar } from '@/components/SearchBar';
import { BlockchainStatsDashboard } from '@/components/BlockchainStatsDashboard';
import { BlocksTable } from '@/components/BlocksTable';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MiningStats } from '@/components/MiningStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * PRODUCTION-GRADE BLOCKCHAIN EXPLORER
 * 
 * Main dashboard displaying:
 * - Real blockchain statistics
 * - Latest blocks and transactions
 * - Mining pool information
 * - Search functionality
 * 
 * All data is real, sourced from silver-storage and silver-pow
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">
              SilverBitcoin Explorer
            </h1>
            <p className="mt-2 text-slate-600">
              Real-time blockchain explorer for the SilverBitcoin network
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics Dashboard */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Blockchain Statistics
          </h2>
          <BlockchainStatsDashboard />
        </section>

        {/* Tabs for Blocks, Transactions, and Mining */}
        <section>
          <Tabs defaultValue="blocks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="blocks">Latest Blocks</TabsTrigger>
              <TabsTrigger value="transactions">Latest Transactions</TabsTrigger>
              <TabsTrigger value="mining">Mining Pool</TabsTrigger>
            </TabsList>

            {/* Blocks Tab */}
            <TabsContent value="blocks" className="mt-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Latest Blocks
                </h3>
                <BlocksTable limit={10} showPagination={true} />
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Latest Transactions
                </h3>
                <TransactionsTable limit={25} showPagination={true} />
              </div>
            </TabsContent>

            {/* Mining Tab */}
            <TabsContent value="mining" className="mt-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Mining Pool Statistics
                </h3>
                <MiningStats />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Footer Info */}
        <section className="mt-12 rounded-lg bg-blue-50 p-6 text-blue-900">
          <h3 className="mb-2 font-semibold">About This Explorer</h3>
          <p className="text-sm">
            This blockchain explorer provides real-time access to SilverBitcoin
            network data. All information is sourced directly from the blockchain
            and mining pool. Data is updated every 5-30 seconds depending on the
            endpoint.
          </p>
        </section>
      </div>
    </div>
  );
}
