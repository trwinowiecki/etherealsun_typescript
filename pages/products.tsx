import { GetStaticProps } from 'next'

const products = () => {
  return (
    <ProductList></ProductList>
  )
}


export const getStaticProps: GetStaticProps = async (ctx) => {
  const { data } = await  // your fetch function here 

  return {
    props: {
      
    },
    revalidate: 60
  }
}

export default products