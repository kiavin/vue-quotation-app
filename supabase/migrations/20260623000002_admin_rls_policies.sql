-- Allow super admins full access to core tables

CREATE POLICY "Super admins full access to organizations" ON public.organizations
FOR ALL USING (public.is_super_admin());

CREATE POLICY "Super admins full access to profiles" ON public.profiles
FOR ALL USING (public.is_super_admin());

CREATE POLICY "Super admins full access to organization_members" ON public.organization_members
FOR ALL USING (public.is_super_admin());

CREATE POLICY "Super admins full access to invoices" ON public.invoices
FOR ALL USING (public.is_super_admin());

CREATE POLICY "Super admins full access to quotations" ON public.quotations
FOR ALL USING (public.is_super_admin());
