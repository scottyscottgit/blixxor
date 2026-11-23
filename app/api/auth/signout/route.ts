import { createClient } from '../../../../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()

  // On vérifie si un utilisateur est bien connecté
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  // On dit à Next.js que les données de la page d'accueil ont changé
  revalidatePath('/', 'layout')
  
  // On redirige vers la page de login
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}