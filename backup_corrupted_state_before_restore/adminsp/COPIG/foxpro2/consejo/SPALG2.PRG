procedure spalg2
*listado de profesionales
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES ALFABETICO'
set talk off
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
use sptempo
zap
set exclusive off
whabi=' '
WFECHA=DATE()
wop=1
wnomtit=space(30)
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
   @12,01 SAY 'Apellido y Nombre desde: '
   @13,01 say 'Apellido y NOmbre hasta: '
   wnomdes=space(30)
   wnomhas=space(30)
   @12,30 get wnomdes
   @13,30 get wnomhas
   read
   @15,45 say 'Domicilios'
   wopdom=1
   @15,45 get wopdom pict '@*RVT \<Todos; \<Dom.No Actualizados; \<Actualizados' size 1,1 color scheme 4
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
                     if habili > 1989 and habili < 1992 
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
         sort to sptempos on provin, dpto, nombre
         do imprime
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptempos on nombre, dpto;
            for dpto=wdpto
            do imprime
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptempos on nombre, titulo;
               for titulo=wtitulo
               do imprime
            else
               sort to sptempos on nombre, dpto;
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
   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   wlin=0
   whoja=1
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego+wtitu
   do while .not. eof()
      wtitulo=titulo
*      if catego+titulo<>wkey
*         if titulo<>wtitulo
*            wtitulo=titulo
*            select 5
*            use sptitu order titulo
*            seek(wtitulo)
*            if found()
*               wnomtit=titplur
*            else
*               wnomtit=space(30)
*            endif
*            select 1      
*         endif
*         if catego<>wcatego
*            wcatego=catego
*            wcateg=catego
*            wlin=96
*         endif
*         wkey=wcatego+wtitulo      
 *        do titulosb
         if wlin > 85
            do titulos
*            do titulosb
*         else
*            do titulosb   
         endif   
*      endif   
      select 5
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
      select 4
      use spprov order prov
      seek(a.provin)
      if found()
         wnoprov=nombre
      else   
         wnoprov=space(10)
      endif   
      select 5
      use sptitu order titulo
      seek(wtitulo)
      if found()
         wnomtit=titdesc
      else
         wnomtit=space(30)
      endif
      select 1         
     * if whoja=0
     *    do titulos
     * endif   
      ?numero pict '99999'
      ??catego at 6
    *  ??titulo at 13 
      ??nombre  at 9
      ?? wnomtit at 40
      if tipodom <> 0 
         ?? '**1' at 71
      endif
      ?? telef at 75  
      ??domici  
*      ??habili at 106 pict '9999'
      if condic = '1' or condic = '0'
         ?? ' '
      else
         if condic = '2'
            ?? ' C.DEP'
         else
            if condic = '3'
               ?? ' FALL'
            else
               ?? ' OTRA'
            endif
         endif
      endif                  
*      ?? telef 
      ??' '+rtrim(wnomlocali)+'-'+rtrim(wnomdpto)
      if provin <> 1
         ?? wnoprov 
      endif
      wlin=wlin+1
      if wlin > 85
 *        eject
         do titulos
*         do titulosb
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

procedure titulos
if wlin > 85
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE PROFESIONALES           ' AT 20
*?? wcateg at 57
if whabi='S'
   ??' (habilitados)' at 61
else
   if whabi='N'
      ??' (no habilitados)' at 61
   endif      
endif
?? 'Fecha: ' at 80
?? wfecha at 87   
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
?? 'TITULO   ' AT 47
?? 'DOMICILIO' AT 79
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
if wcatego <> '  ' and catego = 'CR'
   wop = 1
else   
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
      if wdpto=0 or dpto=wdpto
         if b.nombre > wnomdes and b.nombre <= wnomhas
*           if b.nacio={  /  /  } 
			wpase=0
			if wopdom=1
				wpase =1
			else
				if wopdom=2
				   if b.tipo<>0
				     	wpase=1
				   endif
				else
				   if wopdom=3
				      if b.tipo=0
				         wpase=1
				      endif   
				   endif
				endif
			endif
			if wpase = 1
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
*       	 	 if b.provin > 1 
*       	 	 	replace dpto with 19
*       	 	 else
       	 	    replace dpto   with b.dpto
*       	 	 endif   
       	 	 replace locali with b.locali
       		  replace telef  with ltrim(b.telef)
       		  replace tipodom with b.tipo
       		  replace fecha   with b.nacio
       		endif  
*       	  endif	  
       	 endif
      endif
   endif
endif   
return