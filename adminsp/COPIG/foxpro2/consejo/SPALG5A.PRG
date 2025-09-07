procedure spalg5a
*rotulos de profesionales
* utilizando sptempo creado
@04,01 clear to 23,78
@04,28 say 'ROTULOS DE PROFESIONALES'
set exclusive off
set safety off
wfecha=date()
select 3
use sptempo
*set exclusive off
whabi=' '
wcatego=space(2)
wop=1
wnomtit=space(25)
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
         sort to sptempos on provin, dpto, catego, titulo, nombre
         do imprime
    endif   
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use sptempos
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   wlin=0
   whoja=0
   wnum=1
   wtitulo=space(3)
   wcateg=catego
   wtitu=titulo
   wkey=wcatego+wtitulo
   do while .not. eof()
   if tipodom = 0
      if catego+titulo<>wkey
         if titulo<>wtitulo
            wtitulo=titulo
            select 5
            use sptitu order titulo
            seek(wtitulo)
            if found()
               wnomtit=titdesc
            else
               wnomtit=space(30)
            endif
            select 1      
         endif
         if catego<>wcatego
            wcatego=catego
            wcateg=catego
            wlin=96
         endif
         wkey=wcatego+wtitulo      
      endif
      wcopost=space(4)   
      select 6
      use splocal order cod
      seek(a.locali)
      if found()
         wnomlocali=nombre
         if cpost <> '    '
            wcopost=cpost
         endif
      else
         wnomlocali=space(15)
      endif
      select 4
      use spdpto order dpto
      seek(a.dpto)
      if found()
         wnomdpto=nombre
         if wcopost = '    '
            if cpost <> '    '
               wcopost = cpost
            endif
         endif       
      else   
         wnomdpto=space(15)
      endif
      wprovc=space(15)
         select 7
         use spprov order prov
         seek(a.provin)
         if found()
            wprovc=nombre
            if wcopost = '    '
               if cpost <> '    '
                  wcopost= cpost
               endif
            endif      
         else
            wprovc=space(15)
         endif
         select 1         
     if wnum = 1
        wmat1 = numero
        wcat1 = wcateg
        wnom1 = nombre
        wdom1 = substr(domici,1,33)
        wloc1 = wnomlocali
        wdpto1 = wnomdpto
        wcpo1 = wcopost
        wpcia1 = wprovc
        wtitu1 = wnomtit
        wnum = wnum+1
     else   
        if wnum = 2
           wmat2 = numero
           wcat2 = wcateg
           wnom2 = nombre
           wdom2 = substr(domici,1,33)
           wloc2 = wnomlocali
           wdpto2 = wnomdpto
           wcpo2 = wcopost
           wpcia2 = wprovc
           wtitu2 = wnomtit
           do rotulo
              wnum = 1
        endif
     endif   
   endif              
   skip
   enddo
   do rotulo
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return


procedure rotulo
?
? wmat1 at 6
?? '-'
?? wcat1
?? wmat2 at 45
?? '-'
?? wcat2
? wtitu1 at 1
?? wtitu2 at 40
? wnom1 at 1
?? wnom2 at 38
? wdom1 at 1
?? wdom2 at 38
? wcpo1 at 1
?? wloc1 at 6
?? wcpo2 at 38
?? wloc2 at 44
? wdpto1 at 1
?? wpcia1 at 16
?? wdpto2 at 38
?? wpcia2 at 55
?
?
return

procedure titulos
if wlin > 85
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE PROFESIONALES CATEGORIA ' AT 20
?? wcateg at 57
if whabi='S'
   ??' (habilitados)' at 61
else
   if whabi='N'
      ??' (no habilitados)' at 61
   endif      
endif
??'Fecha: ' at 80
?? wfecha  at 87 
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
?? ' DOMICILIO' AT 47
?? ' TELEFONO ' AT 78
wlin = 5
return
procedure titulosb
?
?wnomtit AT 55
?
*?'MATRIC. CAT.   NOMBRE'
*??'DOMICILIO' at 47
*?
wlin=wlin+3
return

procedure arma
if wcatego <> '  ' and catego = 'CA'
   wop = 1
else   
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
      if wdpto=0 or dpto=wdpto
         select 3
         append blank
         replace numero with a.numero
         replace catego with a.catego
         replace titulo with a.titulo
         replace habili with a.habili
         replace condic with a.condic
         replace dctipo with b.dctipo
         replace dcnro  with b.dcnro
         replace nombre with b.nombre
         replace domici with b.domici
         replace provin with b.provin
         replace dpto   with b.dpto
         replace locali with b.locali
         replace telef  with ltrim(b.telef)
      endif
   endif
endif   
return