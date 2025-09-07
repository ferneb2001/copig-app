procedure spalem2
*listado de totales empresas por a¤o de inscripcion
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS '
select 2
use spprofe index spprofe
*select 3
set exclusive on
set safety off
*use emtempo
*zap
set exclusive off
whabi=' '
wcont=0
wco95=0
wco94=0
wco93=0
wco92=0
wco91=0
wco90=0
wco89=0
wco88=0
wco87=0
wco86=0
wco85=0
wco00=0
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
            if whabi=' '
               do arma
            else
               if whabi='S' 
                  if habili >=  wanhabi .and. condic < '2'
                     do arma
                  endif   
               else
                  if habili < wanhabi
                     do arma
                  endif   
               endif
             endif          
         endif      
         select 1
         skip
      enddo
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
   wlin=0
   whoja=1
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego
      ? ' 1995 ' at 10
      ?? wco95   at 50 pict '99999'
         wcont=wcont+wco95
      ? ' 1994 ' at 10
      ?? wco94   at 50 pict '99999'
         wcont=wcont+wco94
      ? ' 1993 ' at 10
      ?? wco93   at 50 pict '99999'
         wcont=wcont+wco93
      ? ' 1992 ' at 10
      ?? wco92   at 50 pict '99999'
         wcont=wcont+wco92
      ? ' 1991 ' at 10
      ?? wco91   at 50 pict '99999'
         wcont=wcont+wco91
      ? ' 1990 ' at 10
      ?? wco90   at 50 pict '99999'
         wcont=wcont+wco90
      ? ' 1989 ' at 10
      ?? wco89   at 50 pict '99999'
         wcont=wcont+wco89
      ? ' 1988 ' at 10
      ?? wco88   at 50 pict '99999'
         wcont=wcont+wco88
      ? ' 1987 ' at 10
      ?? wco87   at 50 pict '99999'
         wcont=wcont+wco87
      ? ' 1986 ' at 10
      ?? wco86   at 50 pict '99999'
         wcont=wcont+wco86
      ? ' 1985 y ant. ' at 10
      ?? wco85   at 50 pict '99999'
         wcont=wcont+wco85
      ? ' cero ' at 10
      ?? wco00   at 50 pict '99999'
         wcont=wcont+wco00
      endif
*   skip
   ?
   ?
   ?
   ? 'Total empresas: ' at 15
   ?? wcont pict '999999' at 50
*   ???chr(27)+chr(18)
*    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
@04,01 clear to 23,78
return

procedure titulos
if wlin > 85
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE EMPRESAS POR A¥O PAGO HABILITACION  ' AT 20
?? 'Fecha: ' at 65
?? wfecha    at 72   
?
? 'PAGADO MATRICULA A¥O '
?? 'CANTIDAD ' AT 47
wlin = 5
return

procedure arma
if habili=0
   wco00=wco00+1
else   
   if habili = 1995
      wco95=wco95+1
   else   
      if habili = 1994
         wco94=wco94+1
      else
         if habili = 1993
            wco93=wco93+1
         else   
            if habili = 1992
               wco92=wco92+1
            else   
               if habili = 1991
                  wco91=wco91+1
               else   
                  if habili = 1990
                     wco90=wco90+1
                  else
                     if habili = 1989
                        wco89=wco89+1
                     else   
                        if habili = 1988
                           wco88=wco88+1
                        else   
                           if habili = 1987
                              wco87=wco87+1 
                           else
                              if habili = 1986
                                 wco86=wco86+1
                              else   
                                 if habili <= 1985
                                    wco85=wco85+1
                                 endif
                              endif
                           endif
                        endif
                     endif
                  endif
               endif
            endif
         endif
      endif
   endif                                 
endif
return