procedure spalg5
*rotulos de profesionales
@04,01 clear to 23,78
@04,28 say 'ROTULOS DE PROFESIONALES'
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
wfecha=date()
use sptempo
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(25)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitados;\<No habilitados;\<Todos';
       color scheme 5
read
@23,01 clear to 23,78
*if wop<>1
   if wop=1
      whabi='S'
   else
      if wop=2
         whabi='N'
      else
         whabi=' '
      endif      
   endif      
   wop=1
   @08,25 say 'Categor¡a'
   @10,25 get wop pict '@*RVT \<Una categoria;\<Todas' color scheme 4
   read
   @23,01 clear to 23,78
   wcatego='  '
   if wop<>2
      @23,01 say 'Indique la categoria a listar'
      @23,31 get wcatego pict '!!'
      read
      @23,01 clear to 23,78
   endif
   @08,45 say 'Titulos'
   wop=1
   wtitulo=space(3)
   wnomtit=space(25)
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
      wnomtit=titdesc
      @23,01 clear to 23,78
   endif
   wop=1
   wdpto=0
   wnomdpto=space(15)
   @08,60 say 'Departamentos'
   @10,60 get wop pict '@*RVT \<Un departamento;\<Todos' color scheme 4
   read
   if wop=2
      wdpto=0
   else      
      @23,01 say 'Seleccione departamento a listar y oprima <ESC>'
      define window pdpto from 06,30 to 22,50
      activate window pdpto
      select 4
      use spdpto order dpto
      brow in window pdpto
      deactivate window pdpto
      @23,01 clear to 23,78
      wdpto=dpto
      wnomdpto=nombre
   endif
   @20,01 say 'Se listar n todos los profesionales '
   if wcatego<>'  '
      @20,37 say wcatego
      @20,39 say ', '
   endif   
   if wtitulo<>'   '
      @20,40 say rtrim(wnomtit)
   endif
   if whabi='S'
      @21,01 say '   habilitados'
   else
      if whabi='N'
         @21,01 say 'no habilitados'
      endif
   endif
   if wdpto>0
      @21,16 say 'del departamento '
      @21,33 say wnomdpto
   endif
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      select 1
      use spmatri
      go top
      set clock on
      @14,21 to 16,58
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         if wcatego='  ' or catego=wcatego
            if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
                  do arma
               else
                  if whabi='S' 
                     if habili > 1991 and condic < '2'
                        do arma
                     endif   
                  else
                     if habili < 1992 and condic < '2'
                        do arma
                     endif   
                  endif
               endif          
            endif
         endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
         sort to sptempos on provin, dpto, catego, titulo, nombre
         do imprime
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptempos on provin, dpto, catego, titulo, nombre;
            for dpto=wdpto
            do imprime
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptempos on provin, dpto, catego, titulo, nombre;
               for titulo=wtitulo
               do imprime
            else
               sort to sptempos on provin, dpto, catego, titulo, nombre;
               for dpto=wdpto .and. titulo=wtitulo
               do imprime
            endif      
         endif   
     endif
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
*   ???chr(27)+chr(15)
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
?? wnom2 at 39
? wdom1 at 1
?? wdom2 at 39
? wcpo1 at 1
?? wloc1 at 6
?? wcpo2 at 39
?? wloc2 at 44
? wdpto1 at 1
?? wpcia1 at 16
?? wdpto2 at 39
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
*if wcatego <> '  ' and catego = 'CA'
*   wop = 1
*if catego = 'A ' or catego = 'CA' or catego = 'E ' or catego = 'D '
*   wop=1
*else   
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
      if b.tipo=0
*    indica que tiene domicilio normal, caso contrario tipo=1 no act.domic.      
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
            replace tipodom with b.tipo
            replace locali with b.locali
            replace telef  with ltrim(b.telef)
         endif   
      endif
*   endif
endif   
return