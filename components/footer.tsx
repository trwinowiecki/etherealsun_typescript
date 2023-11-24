import Divider from '@ui/divider';

function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center footer">
      <Divider width="w-[95vw]" />
      <div className="h-10">
        Copyright &copy; {new Date().getFullYear()} EtherealSunDesigns
      </div>
    </footer>
  );
}

export default Footer;
