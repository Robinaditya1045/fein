'use client'

import React, { useEffect, useState } from 'react'
import FeinAddress from '@/contract_data/Fein-address.json';
import FeinAbi from '@/contract_data/Fein.json';
import { ethers } from 'ethers';
import Loader from '../loader';
import axios from 'axios';
import AdminTokenCard from '@/components/cards/AdminTokenCard';

const Page = () => {
    const [Fein, setFein] = useState<any>(null);
    const [adminAddress, setAdminAddress] = useState<string | null>(null);
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);
    const [releasedTokens, setReleasedTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setCurrentAddress(address);

                const contractInstance5 = new ethers.Contract(
                    FeinAddress.address,
                    FeinAbi.abi,
                    signer
                );
                setFein(contractInstance5);
            } else {
                alert('MetaMask not detected. Please install MetaMask.');
            }
        };

        init();
    }, []);

    useEffect(() => {
        const getOwner = async () => {
            if (Fein) {
                const res = await Fein.getContractOwner();
                setAdminAddress(res);
            }
        }
        getOwner();
    }, [Fein]);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await axios.get('/api/getTokensToDistribute');
                console.log('data', response.data);
                setReleasedTokens(response.data.mintedTokens);
            } catch (error) {
                console.error('Error fetching tokens:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
    }, []);
    console.log('releasedTokens', releasedTokens);

    if (loading) {
        return <Loader />;
    }

    if (currentAddress !== adminAddress) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8">Admin Page</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-24">
                {releasedTokens.map((token, index) => (
                    <AdminTokenCard
                        key={index}
                        tokenId={token.tokenId}
                        tokenName={token.tokenName}
                        imageUrl={`https://emerald-managerial-firefly-535.mypinata.cloud/ipfs/${token.tokenThumbail}`}
                        isReleased={token.isReleased}
                        tokenPrice={token.tokenPrice}
                        availableToken={token.availableToken}
                      />
                ))}
            </div>
        </div>
    )
}

export default Page;