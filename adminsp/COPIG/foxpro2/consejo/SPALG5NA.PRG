procedure spalg5na
*rotulos de profesionales impresion comprimido
* usando sptempo creado
@04,01 clear to 23,78
@04,28 say 'ROTULOS DE PROFESIONALES'
set exclusive on
set safety off
wfecha=date()
*select 3
*use sptempo
whabi=' '
wop=1
wnomtit=space(25)
   wcatego='  '
   wnomtit=space(25)
   wtitulo='   '
   wop=1
   wdpto=0
   wnomdpto=space(15)
   @23,01 clear to 23,78
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
*      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
*      select 3
*      use sptempo
*        sort to sptempos on provin, dpto, catego, titulo, nombre
         do imprime
   endif   
*endif
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
*   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
    ???chr(15)
   wlin=0
   whoja=0
   wnum=1
   wcateg=catego
   wtitu=titulo
*   do titulos
   wkey=wcatego+wtitu
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
 *                  do titulosb
*                   if wlin > 85
*                      do titulos
*                      do titulosb
*                   else
*                      do titulosb   
*                   endif   
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
*        if str(a.provin,3)<>'  1'
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
*                   endif         
         select 1         
     * if whoja=0
     *    do titulos
     * endif
        if wnum = 1
           wmat1 = numero
           wcat1 = wcateg
           wnom1 = nombre
           wdom1 = domici
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
              wdom2 = domici
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
    ???chr(18)
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
*?
? wmat1 at 6
?? '-'
?? wcat1
?? wmat2 at 72
?? '-'
?? wcat2
?
? wtitu1 at 1
?? wtitu2 at 67
? wnom1 at 1
?? wnom2 at 66
? wdom1 at 1
?? wdom2 at 66
? wcpo1 at 1
?? wloc1 at 6
?? wcpo2 at 66
?? wloc2 at 71
? wdpto1 at 1
?? wpcia1 at 16
?? wdpto2 at 66
?? wpcia2 at 82
?
?
return

procedure titulos
return

