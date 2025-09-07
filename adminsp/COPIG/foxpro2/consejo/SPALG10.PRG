procedure spalg10
*listado de profesionales
* Inscriptos o matriculados por mes o entre fechas
SET TALK OFF
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
use sptempo
zap
set exclusive off
set date ymd
wfecha=date()
@22,50 say wfecha
wdesde={  /  /  }
whasta=date()
whabi=' '
wop=1
wcuil=0
wcuen=0
wnomtit=space(30)
@08,02 say 'Par metros'
@10,02 say 'Ingresados desde: '
@13,02 say '           hasta: '
@11,10 get wdesde
@14,10 get whasta
read
@23,01 clear to 23,78
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
   @16,60 get wcuil pict '@*RVT \<Con CUIT;\<Sin CUIT' color scheme 4
   read
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
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         sisi=1
         if inscr<>{  /  /  }
	         if inscr >= wdesde .and. inscr <= whasta
    	        sisi=0
    	     endif   
       	 else
            if fechab >= wdesde .and. fechab <= whasta
               sisi=0
            endif
         endif
         if sisi=0          
           if wcatego='  ' or catego=wcatego
               if whabi=' '
                     do arma
               else
                  if whabi='S' 
                     if habili > 1991 and condic < '2'
                        @20,30 SAY PAGO
                           do arma
                     endif
                  else
                     if habili < 1992
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
         sort to sptempos on numero, catego
         do imprime
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptempos on numero, catego;
            for dpto=wdpto
            do imprime
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptempos on numero, catego;
               for titulo=wtitulo
               do imprime
            else
               sort to sptempos on numero, catego;
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
set date dmy
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
   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
   wlin=96
   whoja=0
   wcateg=catego
   wtitu=titulo
   do titulos
*   wkey=wcatego+wtitu
   wkey=space(5)
   do while .not. eof()
*      if catego+titulo<>wkey
*         if titulo<>wtitulo
            wtitulo=titulo
            select 5
            use sptitu order titulo
            seek(wtitulo)
            if found()
               wnomtit=titplur
            else
               wnomtit=space(30)
            endif
            select 1      
*         endif
*         if catego<>wcatego
            wcatego=catego
            wcateg=catego
*            wlin=96
*         endif
         wkey=wcatego+wtitulo      
 *        do titulosb
*         if wlin > 66
*            do titulos
*            do titulosb
*         else
*            do titulosb   
*         endif   
*      endif   
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
     * if whoja=0
     *    do titulos
     * endif   
      ?numero pict '9999'
      ??catego at 5 
      ??nombre  at 08
	  ??titotorga at 39
*	  ??' '
      if wcuil = 0
	     ?? cuil
	  endif   
      wlin=wlin+1
      wcuen=wcuen+1
      if wlin > 66
 *        eject
         do titulos
         do titulosb
      endif
   skip
   enddo
   ?
   ?
   ? 'Total de profesionales listados: '
   ?? wcuen
*   ???chr(27)+chr(18)
*    ???chr(27)+chr(50)
*    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if whoja <> 0
   if wlin > 66
      eject
   endif
endif      
whoja=whoja+1
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE PROFESIONALES CATEGORIA ' AT 05
?? wcateg at 41
if whabi='S'
   ??' (habilitados)' at 61
else
   if whabi='N'
      ??' (no habilitados)' at 61
   endif      
endif
?'            Matriculados entre el '
?? wdesde
?? ' y el '
??whasta   
??'HOJA NRO. ' at 65
??whoja pict '999'
?
? 'MATR.CAT.  APELLIDO Y NOMBRE' 
?? ' Entidad Otorgante T¡tulo' AT 43
if wcuil = 0
   ?? ' C.U.I.T. ' AT 70
endif   
wlin = 5
return


procedure titulosb
?
?wnomtit AT 25
?
wlin=wlin+3
return

procedure arma
@21,30 say pago
*@21,60 get wop
wop=0
*read
if a.catego = 'A ' or a.catego='CR' or a.catego='CA' or a.catego='CT'
*   if a.numero > 7278
      wop=1
endif
*else
*   if a.catego = 'B1'
*      if a.numero > 5257 and a.numero < 5299
*        wop=1
*      endif
*   endif
*endif
wnoment=space(30)
if wop=0        
 select 2
 seek(str(a.dctipo,1)+str(a.dcnro,8))
 if found()
 *   if a.titulo = '001' or a.titulo = '002' or a.titulo = '003' or a.titulo = '042' or a.titulo = '801'
      @18,1 say a.numero
      @18,7 say a.catego
      @18,10 say b.nombre
      @18,60 say b.nacio
 *     if dpto = 11 or dpto = 12 
 *           if b.nacio > {31/10/49}
 *           @19,60 say b.nacio
         select 7
         use spente order codigo
         seek(a.otorga)
         if found()
         	wnoment=nombre
         else
         	wnoment=space(30)
         endif		
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
         replace titotorga with wnoment
         replace cuil with b.cuit
         if a.inscr<>{  /  /  }
            replace fecha  with a.inscr
         else
            if a.fechab<>{  /  /  }
               replace fecha with a.fechab
            else   
               replace fecha with a.feccert
            endif   
         endif   
     endif 
endif
*endif
return