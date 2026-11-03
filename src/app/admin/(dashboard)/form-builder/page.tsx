import { FormBuilder } from "@/components/admin/FormBuilder";
import { getPublishedFormSchema } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function FormBuilderPage() {
  const schema = await getPublishedFormSchema();
  return <FormBuilder initialSchema={schema} />;
}
