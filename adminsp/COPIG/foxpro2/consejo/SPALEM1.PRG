procedure spalem1
*listado de empresas
* CON A¤O DE HABILITACION hasta 1996.
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS '
select 2
use spprofe index spprofe
select 3
set exclusive on
set safety off
use emtempo
zap
set exclusive off
whabi=' '
set date to ymd
wcont=0
wanhabi=0
wfecha={  /  /  }
@06,10 say 'Fecha del listado: '
@06,40 get wfecha
read
wop=1
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitadas;\<No habilitadas;\<Todas';
       color scheme 5
read
@23,01 clear to 23,78
   if wop=1
      whabi='S'
      @14,02 say 'Digite a¤o de habilitaci¢n'
      @14,32 get wanhabi pict '9999' 
   else
      if wop=2
         whabi='N'
      @14,02 say 'Digite a¤o de habilitaci¢n'
      @14,32 get wanhabi pict '9999' 
      else
         whabi=' '
      endif      
   endif      
   wop=1
   wcatego='EM'
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
   @20,01 say 'Se listar n todas las empresas '
   if whabi='S'
      @21,01 say '   habilitadas'
   else
      if whabi='N'
         @21,01 say 'no habilitadas'
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
      use spmatrie
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         if wcatego='EM'
         *   if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
                  do arma
               else
                  if whabi='S' 
                     if habili >=  wanhabi .and. condic < '2'
                        do arma
                     endif   
                  else
                     if habili < wanhabi .and. condic < '2'
*                        if habili > 1990
                           do arma
*                        endif   
                     endif   
                  endif
                endif          
           * endif
         endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0  
         sort to emtempos on catego, nombre, dpto
         do imprime
      else   
         if wdpto<>0 
            sort to emtempos on catego, nombre, dpto;
            for dpto=wdpto
            do imprime
        * else
        *    if wdpto=0 .and. wtitulo<>'   '
        *       sort to sptempos on catego, titulo, nombre, dpto;
        *       for titulo=wtitulo
        *       do imprime
        *    else
        *       sort to sptempos on catego, titulo, nombre, dpto;
        *       for dpto=wdpto .and. titulo=wtitulo
        *       do imprime
        *    endif      
         endif   
     endif
  endif   
*endif
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
set date to dmy
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use emtempos
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
   wlin=96
   whoja=0
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego
   do while .not. eof()
      if catego<>wkey
       *  if titulo<>wtitulo
       *     wtitulo=titulo
       *     select 5
       *     use sptitu order titulo
       *     seek(wtitulo)
       *     if found()
       *        wnomtit=titplur
       *     else
       *        wnomtit=space(30)
       *     endif
       *     select 1      
       *  endif
         if catego<>wcatego
            wcatego=catego
            wcateg=catego
            wlin=96
         endif
         wkey=wcatego      
 *        do titulosb
         if wlin > 85
            do titulos
       *     do titulosb
       *  else
       *     do titulosb   
         endif   
      endif
      wnomlocali=space(15)
      wnomdpto=space(15)   
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
         wnomdpto=space(15)
      endif
      wprov=space(15)
      if a.provin = 0 or a.provin = 1
         wprov=space(15)
      else
         select 6
         use spprov order prov
         locate for prov=a.provin
         if found()
            wprov=nombre
         endif
      endif  
         select 1         
     * if whoja=0
     *    do titulos
     * endif   
      ?numero pict '99999'
      ??catego at 7 
      ??nombre  at 10
 *     ??dcnro at 62 pict '99999999'
      ??domici  at 62
      ??alltrim(telef)
      ??' '
      ??habili pict '9999' at 105
      ??' '+rtrim(wnomlocali)+'-'+rtrim(wnomdpto)+' '+rtrim(wprov)
      wcont=wcont+1
      wlin=wlin+1
      if wlin > 85
 *        eject
         do titulos
     *    do titulosb
      endif
   skip
   enddo
   ?
   ?
   ?
   ? 'Total empresas: ' at 15
   ?? wcont pict '999999'
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
if whabi = "N"
  ? 'Deben inscripciones anteriores a 1997' at 70
endif  
?'LISTADO DE EMPRESAS  ' AT 20
*?? wcateg at 57
if whabi='S'
   ??' (habilitadas)' at 44
else
   if whabi='N'
      ??' (no habilitadas)' at 44
   endif      
endif
?? 'Fecha: ' at 65
?? wfecha    at 72   
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
*?? 'DOCUMENTO' AT 62
?? 'DOMICILIO' AT 72
wlin = 5
return

*procedure titulosb
*?
*?wnomtit AT 55
*?
*?'MATRIC. CAT.   NOMBRE'
*??'DOMICILIO' at 47
*?
*wlin=wlin+3
*return

procedure arma
wlistasi=0
@15,01 say a.inscr
if a.inscr>{96/12/31}
   wlistasi=1
else
   if a.inscr={  /  /  }
      if a.fechab>{96/12/31}
         wlistasi=1
      endif   
   endif
endif
@16,01 say wlistasi pict '9'      
wopxx=space(1)
@23,78 get wopxx pict 'X'
read
if wopxx='n'
    wlistasi=0
endif    
if wlistasi=1 
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
*  if provin = 0 or provin = 1
*   if dpto < 7             
      select 3
      append blank
      replace numero with a.numero
      replace catego with a.catego
*      replace titulo with a.titulo
      replace habili with a.habili
      replace condic with a.condic
      replace dctipo with b.dctipo
      replace dcnro  with b.dcnro
      replace nombre with b.nombre
      replace domici with b.domici
      replace provin with b.provin
      replace dpto   with b.dpto
      replace locali with b.locali
      replace telef  with b.telef
*   endif
 endif  
endif
return