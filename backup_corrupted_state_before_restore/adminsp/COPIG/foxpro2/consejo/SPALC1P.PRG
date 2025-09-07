   @08,45 say 'Titulos'
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   @10,45 get wop pict '@*RVT \<Un t¡tulo;\<Todos' color scheme 4
   read
   if wop=2
      wtitulo='   '
   else   
      @23,01 say 'Seleccione titulo a listar y oprima <ESC>'   
      define window ptitu from 06,25 to 22,55
      activate window ptitu
      select 5
      use sptitu order titulo
      brow in window ptitu
      deactivate window ptitu
      wtitulo=titulo
      wnomtit=titplur
      @23,01 clear to 23,78
   endif
   wdpto=0
   wnomdpto=space(15)

   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   wlin=0
   whoja=0
   wcatego='  '
   wcateg=catego
   wtitu=SPACE(3)
      select 6
      use splocal order cod
      seek(a.locali)
      if found()
         wnomlocali=nombre
      else
         wnomlocali=space(15)
      endif
      select 4
      use spdpto order dpto
      seek(a.dpto)
      if found()
         wnomdpto=nombre
      else   
         enomdpto=space(15)
      endif
      wprovc=space(15)
      if str(a.provin,3)<>'  1'
         select 7
         use spprov order prov
         seek(a.provin)
         if found()
            wprovc=nombre
         else
            wprovc=space(15)
         endif
      endif         
         select 1         
      ?numero pict '99999'
      ??catego at 10 
      ??nombre  at 15
      ??domici  at 47
      ?? telef  at 78
      ??' '+rtrim(wnomlocali)+' -  '+rtrim(wnomdpto)+'  '+rtrim(wprovc)
      wlin=wlin+1
   skip
   enddo
*   ???chr(27)+chr(18)
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

