import React, { useState, useEffect } from 'react';
import { useTable, usePagination } from 'react-table';
import './App.css';
import { formatEther } from 'ethers';

function App() {
  const [account, setAccount] = useState('0xMockAccountAddress');
  const [transactions, setTransactions] = useState([
    { hash: '0xMockTransactionHash1', from: '0xMockFromAddress1', to: '0xMockToAddress1', value: '1000000000000000000', timeStamp: '1601510400' },
    { hash: '0xMockTransactionHash2', from: '0xMockFromAddress2', to: '0xMockToAddress2', value: '2000000000000000000', timeStamp: '1601596800' },
    // ... more mock transactions
  ]);

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Transaction Address',
        accessor: 'hash', // assuming 'hash' is the property name for the transaction address
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
        Header: 'Value (ETH)',
        accessor: 'value',
        Cell: ({ value }) => {
          // Check if value is a number before formatting
          return !isNaN(parseFloat(value)) && isFinite(value) ? formatEther(value) : 'N/A';
        },
      },
      {
        Header: 'Timestamp',
        accessor: 'timeStamp',
        Cell: ({ value }) => new Date(value * 1000).toLocaleString(),
      },
    ],
    []
  );

  const data = React.useMemo(() => transactions, [transactions]);

  const [pageCount, setPageCount] = useState(0);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
      manualPagination: true,
      pageCount: pageCount,
    },
    usePagination
  );

  useEffect(() => {
    setPageCount(Math.ceil(transactions.length / pageSize));
  }, [transactions, pageSize]);

  useEffect(() => {
    // Bypass the fetching logic and use hardcoded transactions
    setTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    console.log('Before gotoPage call, pageIndex:', pageIndex);
    gotoPage(pageIndex);
    console.log('After gotoPage call, pageIndex:', pageIndex);
  }, [pageIndex, gotoPage, transactions]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ethereum Wallet Transaction Explorer</h1>
        {account ? (
          <>
            <p>Connected Account: {account}</p>
            <div>
              {transactions.length > 0 ? (
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
                    <button onClick={() => gotoPage(prevPageIndex => prevPageIndex - 1)} disabled={!canPreviousPage}>
                      {'<'}
                    </button>{' '}
                    <button onClick={() => gotoPage(prevPageIndex => prevPageIndex + 1)} disabled={!canNextPage}>
                      {'>'}
                    </button>
                    <span>
                      Page{' '}
                      <strong>
                        {pageIndex + 1} of {pageOptions.length}
                      </strong>{' '}
                    </span>
                    <select
                      value={pageSize}
                      onChange={e => {
                        setPageSize(Number(e.target.value));
                      }}
                    >
                      <option key={8} value={8}>
                        Show 8
                      </option>
                    </select>
                  </div>
                </>
              ) : (
                <p>No transactions found for this account.</p>
              )}
            </div>
          </>
        ) : (
          <button onClick={connectWalletHandler}>Connect to MetaMask</button>
        )}
      </header>
    </div>
  );
}

export default App;
