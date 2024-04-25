import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTable, usePagination } from 'react-table';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('0xFe3B557E8Fb62b89F4916B721be55cEb828dBd73');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const address = addressArray[0];
        setWalletAddress(address);
        console.log('Wallet connected:', address); // Log the connected wallet address
        fetchTransactions();
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY;
    const sepoliaApiUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

    try {
      const response = await axios.get(sepoliaApiUrl);
      if (response.data.status === "1") {
        setTransactions(response.data.result);
        console.log('Fetched transactions:', response.data.result); // Added console log
      } else {
        console.error('Error fetching transactions:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  }, [walletAddress]); // walletAddress is a dependency for fetchTransactions

  useEffect(() => {
    console.log('useEffect triggered for walletAddress:', walletAddress); // Log when useEffect is triggered
    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress, fetchTransactions]); // Add fetchTransactions to the dependency array

  const columns = React.useMemo(
    () => [
      {
        Header: 'Hash',
        accessor: 'hash',
      },
      {
        Header: 'From',
        accessor: 'from',
      },
      {
        Header: 'To',
        accessor: 'to',
      },
      {
        Header: 'Value',
        accessor: 'value',
      },
      {
        Header: 'Time',
        accessor: 'timeStamp',
        Cell: ({ value }) => {
          return new Date(value * 1000).toLocaleString();
        },
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: transactions,
      initialState: { pageIndex: 0, pageSize: 8 },
    },
    usePagination
  );

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={connectWalletHandler}>Connect Wallet</button>
        {walletAddress && (
          <p>Connected Wallet Address: <code>{walletAddress}</code></p>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table {...getTableProps()}>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => {
                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pagination">
              <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {'<<'}
              </button>{' '}
              <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                {'<'}
              </button>{' '}
              <button onClick={() => nextPage()} disabled={!canNextPage}>
                {'>'}
              </button>{' '}
              <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {'>>'}
              </button>{' '}
              <span>
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>{' '}
              </span>
              <span>
                | Go to page:{' '}
                <input
                  type="number"
                  defaultValue={pageIndex + 1}
                  onChange={e => {
                    const page = e.target.value ? Number(e.target.value) - 1 : 0;
                    gotoPage(page);
                  }}
                  style={{ width: '100px' }}
                />
              </span>{' '}
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                }}
              >
                {[8, 10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
