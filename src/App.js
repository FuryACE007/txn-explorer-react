import React, { useState, useEffect } from 'react';
import { useTable, usePagination } from 'react-table';
import './App.css';
import { formatEther } from 'ethers';

function App() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const pageSize = 8;

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
  } = useTable(
    {
      columns,
      data: transactions.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
      initialState: { pageIndex },
      manualPagination: true,
      pageCount: Math.ceil(transactions.length / pageSize),
    },
    usePagination
  );

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${accounts[0]}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`);
        const data = await response.json();
        if (data.status && data.result) {
          setTransactions(data.result);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    console.log('Before gotoPage call, pageIndex:', pageIndex);
    gotoPage(pageIndex);
    console.log('After gotoPage call, pageIndex:', pageIndex);
    console.log('Page index:', pageIndex, 'Page size:', pageSize);
  }, [pageIndex, gotoPage, transactions, pageSize]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ethereum Wallet Transaction Explorer</h1>
        <button onClick={connectWalletHandler}>Connect to MetaMask</button>
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
                    <button onClick={() => setPageIndex(prevPageIndex => Math.max(prevPageIndex - 1, 0))} disabled={!canPreviousPage}>
                      {'<'}
                    </button>{' '}
                    <button onClick={() => setPageIndex(prevPageIndex => prevPageIndex + 1)} disabled={!canNextPage}>
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
          <></>
        )}
      </header>
    </div>
  );
}

export default App;
