import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTime',
})
export class SecondsToTimePipe implements PipeTransform {
  transform(value: number, args?: any): string {
    // Convert total seconds to seconds, minutes, hours
    const seconds = this.getSeconds(value);
    const minutes = this.getMinutes(value);
    const hours = this.getHours(value);

    // Stringify numbers and set defaults if 0
    const sStr: string = seconds && seconds <= 59 ? String(seconds) : '00';
    const mStr: string = minutes && minutes <= 59 ? String(minutes) : '00';
    const hStr: string = hours ? String(hours) : '00';

    // Concat timestring
    const timeString = `${hStr}:${mStr}:${sStr}`;

    return timeString;
  }

  private getSeconds(seconds: number): number {
    return this.pad(Math.round(seconds % 60));
  }

  private getMinutes(seconds: number): number {
    return this.pad(Math.floor(seconds / 60) % 60);
  }

  private getHours(seconds: number): number {
    return this.pad(Math.floor(seconds / 60 / 60));
  }

  private pad(digit: any): number {
    return digit <= 9 ? '0' + digit : digit;
  }
}
