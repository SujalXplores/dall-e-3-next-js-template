import Container from '@/components/container';
import { SignIn } from '@clerk/nextjs';

const Page = () => (
  <Container>
    <SignIn />
  </Container>
);

export default Page;
