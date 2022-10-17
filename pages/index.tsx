import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../components/Layout';
import ProductList from '../components/ProductList';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <Layout>
      <ProductList></ProductList>
    </Layout>
  );
};

export default Home;
